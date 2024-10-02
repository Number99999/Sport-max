import {useState, useEffect} from 'react'
import Modal from 'react-modal';
import './OrderCart.css'

Modal.setAppElement('#root');

export const OrderCart = () => {
    const [orders, setOrders] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [newStatus, setNewStatus] = useState('');
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [orderDetails, setOrderDetails] = useState([]);

    const fetchOrder = async () => {
        await fetch('http://localhost:3001/order-details')
            .then((res) => res.json())
            .then((res1) => {
                setOrders(res1.data);
            });
    }

    useEffect(() => {
        fetchOrder();
    }, [])

    const openModal = (order) => {
        setSelectedOrder(order);
        setNewStatus(order.status);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedOrder(null);
    };

    const changeStatus = (orderId, status) => {
        fetch(`http://localhost:3001/order-details/${orderId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                status: status,
            }),
        })
            .then((response) => response.json())
            .then(() => {
                fetchOrder();
                closeModal();
            });
    };

    const handleSubmit = () => {
        if (selectedOrder) {
            changeStatus(selectedOrder.orderId, newStatus);
        }
    };

    const openDetailsModal = (order) => {
        setSelectedOrder(order);
        setOrderDetails(order.items || []);
        setIsDetailsModalOpen(true);
    };

    const closeDetailsModal = () => {
        setIsDetailsModalOpen(false);
        setSelectedOrder(null);
        setOrderDetails([]);
    };

    return (
        <div className='list-product'>
            <h1>DANH SÁCH ĐƠN HÀNG</h1>
            <div className="listproduct-format-main">
                <p>Người mua</p>
                <p>Mô tả</p>
                <p>Giá trị đơn hàng</p>
                <p>Chi phí ship</p>
                <p>Trạng thái đơn hàng</p>
                <p>Thời gian tạo</p>
                <p>Hành động</p>
            </div>
            <div className="listproduct-allproducts">
                <hr/>
                {orders.map((order, index) => {
                    return <>
                        <div key={index} className="listproduct-format-main listproduct-format">
                            <p>{order?.user?.username}</p>
                            <p>{order?.description}</p>
                            <p>{order?.amount}</p>
                            <p>{order?.shippingFee}</p>
                            <p>{order?.status}</p>
                            <p>{new Date(order?.date).toLocaleString()}</p>
                            <p style={{display: "flex", flexDirection: "column", gap: 15, color: "#b00020"}}> <span style={{cursor: 'pointer'}} onClick={() => openDetailsModal(order)}>Chi tiết</span>
                                <span style={{cursor: "pointer"}} onClick={() => openModal(order)}> Chỉnh sửa </span>
                            </p>
                        </div>
                        <hr/>
                    </>
                })}
            </div>

            <Modal
                isOpen={isModalOpen}
                onRequestClose={closeModal}
                contentLabel="Chỉnh sửa trạng thái"
                style={{
                    overlay: {
                        backgroundColor: 'rgba(0, 0, 0, 0.75)'
                    },
                    content: {
                        top: '50%',
                        left: '50%',
                        right: 'auto',
                        bottom: 'auto',
                        marginRight: '-50%',
                        transform: 'translate(-50%, -50%)',
                        width: '400px',
                        padding: '20px'
                    }
                }}
            >
                <h2>Chỉnh sửa trạng thái đơn hàng</h2>
                <p>Người mua: {selectedOrder?.user?.username}</p>
                <label>
                    Trạng thái:
                    <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                        <option value="success">Success</option>
                        <option value="cancel">Cancel</option>
                    </select>
                </label>
                <div style={{paddingTop: '20px', display: 'flex', gap: '20px'}}>
                    <button onClick={handleSubmit}>Lưu</button>
                    <button onClick={closeModal}>Hủy</button>
                </div>
            </Modal>

            <Modal
                isOpen={isDetailsModalOpen}
                onRequestClose={closeDetailsModal}
                style={{
                    overlay: {
                        backgroundColor: 'rgba(0, 0, 0, 0.75)',
                    },
                    content: {
                        top: '50%',
                        left: '50%',
                        right: 'auto',
                        bottom: 'auto',
                        marginRight: '-50%',
                        transform: 'translate(-50%, -50%)',
                        width: '500px',
                        maxHeight: '80vh',
                        overflowY: 'auto',
                        padding: '20px'
                    }
                }}
            >
                <h2>Chi tiết đơn hàng</h2>
                {orderDetails?.length > 0 ? (
                    <ul>
                            {orderDetails.map((item, idx) => (
                                <li key={idx}>
                                    <p>Tên sản phẩm: {item?.product?.name}</p>
                                    <p>Ảnh: <img src={item?.product?.image} alt="" height="100"/></p>
                                    <p>Giá: {item?.product?.new_price},000đ</p>
                                    <p>Số lượng: {item.quantity}</p>
                                </li>
                            ))}
                    </ul>
                ) : (
                    <p>Không có sản phẩm trong đơn hàng này.</p>
                )}
                <button onClick={closeDetailsModal}>Đóng</button>
            </Modal>
        </div>
    )
}
export default OrderCart;
