import React, { useState, useEffect } from 'react'
import './ListProduct.css'
import cross_icon from '../../assets/cross_icon.png'

export const ListProduct = () => {

  const [allproducts, setAllProducts] = useState([]);

  const fetchInfo = async () => {
    await fetch('http://localhost:3001/allproducts')
    .then((res) => res.json())
    .then((data) => {
      setAllProducts(data);
    });
  }

  useEffect(() => {
    fetchInfo();
  },[])

  const remove_product = async (id) => {
    await fetch('http://localhost:3001/removeproduct',{
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body:JSON.stringify({id:id})
    })
    await fetchInfo();
  }

  return (
    <div className='list-product'>
      <h1>DANH SÁCH SẢN PHẨM</h1>
      <div className="listproduct-format-main">
        <p>Sản phẩm</p>
        <p>Tiêu đề</p>
        <p>Giá cũ</p>
        <p>Giá mới</p>
        <p>Danh mục</p>
        <p>Loại</p>
        <p>Xoá</p>
      </div>
      <div className="listproduct-allproducts">
        <hr />
        {allproducts.map((product, index) => {
          return <> <div key={index} className="listproduct-format-main listproduct-format">
            <img src={product.image} alt="" className="listproduct-product-icon" />
            <p>{product.name}</p>
            <p>{product.old_price},000</p>
            <p>{product.new_price},000</p>
            {/* <p>{product.category}</p> */}
            <p>
              {product.category.join(",") === "men,all"
                ? "Nam"
                : product.category.join(",") === "women,all"
                ? "Nữ"
                : ""}
            </p>
            <p>{product.product_type}</p>
            <img onClick={()=>{remove_product(product.id)}} className='listproduct-remove-icon' src={cross_icon} alt="" />
          </div>
          <hr />
          </>
        })}
      </div>
    </div>
  )
}

export default ListProduct;