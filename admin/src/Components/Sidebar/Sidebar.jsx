import React from 'react'
import './Sidebar.css'
import {Link} from 'react-router-dom'
import add_product_icon from '../../assets/Product_Cart.svg'
import list_product_icon from '../../assets/Product_list_icon.svg'
import statistics_product_icon from '../../assets/statistics_admin.png'
import order_cart from '../../assets/order-cart.png'

export const Sidebar = () => {
  return (
    <div className='sidebar'>
      <Link to={'/addproduct'} style={{textDecoration:"none"}}>
        <div className="sidebar-item">
          <img src={add_product_icon} alt="" />
          <p>Thêm sản phẩm</p>
        </div>
      </Link>
      <Link to={'/listproduct'} style={{textDecoration:"none"}}>
        <div className="sidebar-item">
          <img src={list_product_icon} alt="" />
          <p>Danh sách sản phẩm</p>
        </div>
      </Link>
      <Link className='ordercart' to={'/OrderCart'} style={{textDecoration:"none"}}>
        <div className="ordercart-item ordercart-item__products">
          <img src={order_cart} alt="" />
          <p>Đơn hàng</p>
        </div>
      </Link>
      <Link className='statisticsproduct' to={'/statisticsproduct'} style={{textDecoration:"none"}}>
        <div className="sidebar-item sidebar-item__statisticsproduct">
          <img src={statistics_product_icon} alt="" />
          <p>Thống kê doanh thu</p>
        </div>
      </Link>
    </div>
  )
}

export default Sidebar;
