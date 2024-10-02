import React, {useState} from 'react'
import './AddProduct.css'
import upload_area from '../../assets/upload_area.svg'

export const AddProduct = () => {

  const [image,setImage] = useState(false);
  const [productDetails,setProductDetails] = useState({
    name: "",
    old_price: "",
    new_price: "",
    category: ["women", "all"], 
    product_type: "Tank-Top",
    image: "",
    color: ["Đen", "Trắng","Xám","Đỏ","Xanh cổ vịt"],
    size: ["S", "M", "L", "XL", "XXL"]
  });
  

  const imageHandler = (e) => {
    setImage(e.target.files[0]);
  }
  const changeHandler = (e) => {
    const { name, value } = e.target;

    setProductDetails((prevDetails) => ({
      ...prevDetails,
      [name]: name === "category" ? value.split(",") : value,
    }));
  }

  const Add_Product = async () => {
    console.log(productDetails);
    let responseData;
    let product = productDetails;

    let formData = new FormData();
    formData.append('product', image);

    await fetch('http://localhost:3001/upload', {
      method: 'POST',
      headers: {
        Accept: 'application/json', 
      },
      body: formData,

    }).then((resp) => resp.json()).then((data) => {responseData = data});

    if(responseData.success) {
      product.image = responseData.image_url;
      console.log(product);
      await fetch('http://localhost:3001/addproduct', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(product),
      }).then((resp)=>resp.json()).then((data)=>{
        if (data.success) {
          alert("Đã thêm sản phẩm thành công!");
  
          // Đặt lại state cho các trường nhập
          setProductDetails({
            name: "",
            old_price: "",
            new_price: "",
            category: ["women", "all"],
            product_type: "Tank-Top",
            image: "",
            color: ["Đen", "Trắng","Xám","Đỏ","Xanh cổ vịt"],
            size: ["S", "M", "L", "XL", "XXL"]
          });
  
          // Đặt lại hình ảnh
          setImage(false);
        } else {
          alert("Thêm sản phẩm thất bại!");
        }
      })
    }
  }

  return (
    <div className='add-product'>
      <div className="addproduct-itemfield">
        <p>Tiêu đề sản phẩm</p>
        <input value={productDetails.name} onChange={changeHandler} type="text" name='name' placeholder='Nhập tiêu đề'/>
      </div>
      <div className="addproduct-price">
        <div className="addproduct-itemfield">
          <p>Giá cũ sản phẩm</p>
          <input value={productDetails.old_price} onChange={changeHandler} type="number" name='old_price' placeholder='Nhập giá cũ'/>
        </div>
        <div className="addproduct-itemfield">
          <p>Giá mới sản phẩm</p>
          <input value={productDetails.new_price} onChange={changeHandler} type="number" name='new_price' placeholder='Nhập giá mới'/>
        </div>
      </div>
      <div className="addproduct-itemfield">
        <p>Danh Mục Sản Phẩm</p>
        <select value={productDetails.category.join(",")} onChange={changeHandler} name="category" className="add-product-selector">
          <option value="men,all">Nam</option>
          <option value="women,all">Nữ</option>
        </select>
      </div>
      <div className="addproduct-itemfield">
        <p>Loại Sản Phẩm</p>
        <select value={productDetails.product_type} onChange={changeHandler} name="product_type" className='add-product_type-selector'>
          <option value='Tank-Top'>
            Áo ba lỗ
          </option>
          <option value='Short-Sleeve-Top'>
            Áo ngắn tay
          </option>
          <option value='Shorts'>
            Quần ngắn
          </option>
          <option value='Jogger'>
            Jogger
          </option>
          <option value='Accessory'>
            Phụ kiện
          </option>
          <option value='Thermal-shirt'>
            Áo giữ nhiệt
          </option>
        </select>
      </div>
      <div className="addproduct-itemfield">
        <label htmlFor="file-input">
            <img src={image?URL.createObjectURL(image):upload_area} className='addproduct-thumnail-img' alt="" />
            <input onChange={imageHandler} type="file" name='image' id='file-input' hidden/>
        </label>
      </div>
      <button onClick={()=>{Add_Product()}} className='addproduct-btn'>THÊM SẢN PHẨM</button>
    </div>
  )
}

export default AddProduct;

