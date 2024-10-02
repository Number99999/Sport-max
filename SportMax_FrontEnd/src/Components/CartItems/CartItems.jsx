import React, { useContext, useState, useRef } from 'react';
import '../Responsive/Responsive.css';
import './CartItems.css';
import { ShopContext } from '../../Context/ShopContext';
import remove_icon from '../Assets/cart_cross_icon.png';
import { ToastContainer, toast } from "react-toastify";
import {createPaymentLink} from "../../api/payosApi";
import {UniqueCharOTP} from "unique-string-generator";
import {CircularProgress} from "@mui/material";

export const CartItems = () => {
    const { getTotalCartAmount, all_product, cartItems, addToCart, removeFromCart, removeAllFromCart, getShippingFee, deleteCart, changeStatus } = useContext(ShopContext);
    
    const [promoCode, setPromoCode] = useState('');
    const [discount, setDiscount] = useState(0);
    const [errorMessage, setErrorMessage] = useState('');
    const [copiedCode, setCopiedCode] = useState(null)

    const [openDialogLoading, setOpenDialogLoading] = useState(false);

    const RETURN_URL = `${window.location.origin}/result/`;
    const CANCEL_URL = `${window.location.origin}/cancel-order/`;

    const createPaymentLinkHandle = async function (
        callbackFunction,
        setLoading
    ) {
        setLoading(true);
        try {
            const body = JSON.stringify({
                description: UniqueCharOTP(12),
                returnUrl: RETURN_URL,
                cancelUrl: CANCEL_URL,
                amount: (totalCartAmount + shippingFee - discount) * 1000,
                shippingFee: shippingFee,
                items: all_product.filter(product => cartItems[product.id] > 0).map(product => {
                    return {
                        ...product,
                        "name": product.name,
                        "quantity": cartItems[product.id],
                        "price": product?.new_price * 1000
                    }
                }),
            });
            let response = await createPaymentLink(body);
            if (response.error != 0) throw new Error("Call Api failed: ");
            callbackFunction(response.data);
            setLoading(false);
        } catch (error) {
            console.log(error);
            setLoading(false);
            toast.error("Có lỗi xảy ra");
        }
    };

    const openPaymentDialog = async function (checkoutResponse) {
        if (checkoutResponse) {
            let url = checkoutResponse.checkoutUrl;

            let { open } = window.PayOSCheckout.usePayOS({
                RETURN_URL: RETURN_URL,
                ELEMENT_ID: "config_root",
                CHECKOUT_URL: url,
                onExit: (eventData) => {

                },
                onSuccess: (eventData) => {
                    deleteCart();
                    changeStatus(eventData.orderCode, 'success');
                    window.location.href = `${RETURN_URL}?orderCode=${eventData.orderCode}`;
                },
                onCancel: (eventData) => {
                    deleteCart();
                    changeStatus(eventData.orderCode, 'cancel');
                    window.location.href = `${CANCEL_URL}?orderCode=${eventData.orderCode}`;
                },
            });
            open();
        }
    };

    const handleCopy = (promoCode) => {
      navigator.clipboard.writeText(promoCode)
        .then(() => {
          setCopiedCode(promoCode); // Set the copied promo code
        })
        .catch(() => {
          alert('Sao chép thất bại! Vui lòng thử lại.');
        });
    };

    const totalCartAmount = getTotalCartAmount();
    const shippingFee = getShippingFee(totalCartAmount);

    const applyPromoCode = () => {
      setErrorMessage('');
      if (promoCode === 'T062401K' && totalCartAmount >= 200) {
        setDiscount(10); // Reduce 10K for orders >= 200K
      } else if (promoCode === 'T062403K' && totalCartAmount >= 400) {
        setDiscount(45); // Reduce 45K for orders >= 400K
      } else if (promoCode === 'T062404K' && totalCartAmount >= 500) {
        setDiscount(70); // Reduce 70K for orders >= 500K
      } else {
        setDiscount(0);
        setErrorMessage('Mã giảm giá không hợp lệ hoặc không đáp ứng điều kiện.');
      }
    };

    return (
        <div className='cartitems'>
            <ToastContainer/>
            <div className='cartitems-format-main'>
                <p>Sản phẩm</p>
                <p>Tiêu đề</p>
                <p>Màu/Cỡ</p>
                <p>Giá</p>
                <p>Số lượng</p>
                <p>Tổng tiền</p>
                <p>Xoá</p>
            </div>
            <hr />
            {all_product.map((e) => {
                // const cartItem = cartItems[e.id];
                if (cartItems[e.id]> 0) {
                    const cartItemDetails = cartItems[e.id];
                    return (
                        <div key={e.id}>
                            <div className='cartitems-format cartitems-format-main'>
                                <img src={e.image} alt="" className='carticon-product-icon' />
                                <p>{e.name}</p>
                                <div className='cartitems-color-size'>
                                    <p>{e.color[e.id%6]}</p>
                                    <span>/</span>
                                    <p>{e.size[e.id%6]}</p>
                                </div>
                                <p>{e.new_price},000₫</p>
                                <div className="control-quantity">
                                    <button className='cartitems-quantity'>{cartItems[e.id]}</button>
                                    <div className="control-quantity--action">
                                        <i className="fa-solid fa-plus control-quantity--fa-plus" onClick={() => { addToCart(e.id, e.size, e.color); }}></i>
                                        <i className="fa-solid fa-minus control-quantity--fa-minus" onClick={() => { removeFromCart(e.id, e.size, e.color); }}></i>
                                    </div>
                                </div>
                                <p>{e.new_price * cartItems[e.id]},000₫</p>
                                <img className='cartitems-remove-icon' src={remove_icon} onClick={() => { removeAllFromCart(e.id); }} alt="" />
                            </div>
                            <hr />
                        </div>
                    );
                }
                return null;
            })}
            <div className='cartitems-down'>
                <div className="cartitems-total">
                    <h1>Tổng Thanh Toán</h1>
                    <div>
                        <div className="cartitems-total-item">
                            <p>Tổng tiền sản phẩm</p>
                            <p>{totalCartAmount},000₫</p>
                        </div>
                        <hr />
                        <div className="cartitems-total-item">
                            <p>Phí vận chuyển</p>
                            <p>{shippingFee === 0 ? 'Miễn phí' : `${shippingFee},000₫`}</p>
                        </div>
                        <hr />
                        <div className="cartitems-total-item">
                            <p>Giảm giá</p>
                            <p>{discount > 0 ? `-${discount},000₫` : '0₫'}</p>
                        </div>
                        <hr />
                        <div className="cartitems-total-item">
                            <h3>Tổng tiền toàn bộ:</h3>
                            <h3>{totalCartAmount + shippingFee - discount},000₫</h3>
                        </div>
                    </div>
                    <button
                        variant="contained"
                        onClick={() =>
                            createPaymentLinkHandle(openPaymentDialog, setOpenDialogLoading)
                        }
                        disabled={openDialogLoading}
                        className="!bg-[#5D5FEF] !normal-case"
                    >
                        Mở Dialog thanh toán
                        {openDialogLoading ? (
                            <>
                                {" "}
                                &nbsp; <CircularProgress className="!text-white" size={20} />
                            </>
                        ) : (
                            ""
                        )}
                    </button>
                </div>
                <div className="cartitems-promocode">
                  <p>Nếu bạn có mã giảm giá, hãy nhập vào đây</p>
                  <div className={`cartitems-promobox ${errorMessage ? 'error-border' : 'sucess-border'}`}>
                      <input
                        type="text"
                        placeholder='Mã giảm giá'
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                      />
                      <button onClick={applyPromoCode}>Áp dụng</button>
                  </div>
                  {errorMessage && <p className='cartitems-error-message' style={{ color: 'red' }}>{errorMessage}</p>}
                    <div className="cartitems-promobox__table">
                    <div className='cartitems-promobox__table-header'>
                      <i className="fa-solid fa-tag"></i>
                      <h2>Chương trình khuyến mại</h2>
                    </div>
                    <ul >
                      <li onClick={() => handleCopy('T062401K')}>
                        Nhập mã <strong>T062401K</strong> giảm 10K cho đơn hàng từ 200K 
                        <span 
                          className="copy-button" 
                          style={{ color: copiedCode === 'T062401K' ? 'green' : '#ff5a5a' }}
                        >
                          <br />
                          {copiedCode === 'T062401K' ? 'Đã sao chép' : 'Sao chép'}
                        </span>
                      </li>
                      <li onClick={() => handleCopy('T062403K')}>
                        Nhập mã <strong>T062403K</strong> giảm 45K cho đơn hàng từ 400K 
                        <span 
                          className="copy-button" 
                          style={{ color: copiedCode === 'T062403K' ? 'green' : '#ff5a5a' }}
                        >
                          <br />
                          {copiedCode === 'T062403K' ? 'Đã sao chép' : 'Sao chép'}
                        </span>
                      </li>
                      <li onClick={() => handleCopy('T062404K')}>
                        Nhập mã <strong>T062404K</strong> giảm 70K cho đơn hàng từ 500K 
                        <span 
                          className="copy-button" 
                          style={{ color: copiedCode === 'T062404K' ? 'green' : '#ff5a5a' }}
                        >
                          <br />
                          {copiedCode === 'T062404K' ? 'Đã sao chép' : 'Sao chép'}
                        </span>
                      </li>
                      <li>FREESHIP đơn hàng từ 300K</li>
                    </ul>
                  </div>
                </div>
            </div>
        </div>
    );
};

export default CartItems;
