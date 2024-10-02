import React from 'react'
import './Admin.css'
import Sidebar from '../../Components/Sidebar/Sidebar'
import { Routes, Route } from 'react-router-dom'
import AddProduct from '../../Components/AddProduct/AddProduct'
import ListProduct from '../../Components/ListProduct/ListProduct'
import StatisticsProduct from '../../Components/ProductStatistics/ProductStatistics'
import OrderCart from '../../Components/OrderCart/OrderCart'

export const Admin = () => {
  return (
    <div className='admin'>
      <Sidebar/>
      <Routes>
        <Route path='/addproduct' element={<AddProduct/>}/>
        <Route path='/listproduct' element={<ListProduct/>}/>
        <Route path='/ordercart' element={<OrderCart/>}/>
        <Route path='/statisticsproduct' element={<StatisticsProduct/>}/>
      </Routes>
    </div>
  )
}

export default Admin;
