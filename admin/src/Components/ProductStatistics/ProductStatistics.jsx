import React, { useEffect, useState } from 'react';
import './ProductStatistics.css';

// API route in Express to fetch statistics
// app.get('/product-statistics', async (req, res) => {
//   try {
//     const statistics = await db.query(`
//       SELECT product_type, 
//              MONTH(order_date) as month, 
//              COUNT(*) as total_products_sold, 
//              SUM(new_price) as total_revenue
//       FROM orders
//       WHERE YEAR(order_date) = YEAR(CURDATE())
//       GROUP BY product_type, MONTH(order_date)
//     `);
    
//     res.json(statistics);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });


export const ProductStatistics = () => {
  const [statistics, setStatistics] = useState([]);

  useEffect(() => {
    const fetchStatistics = async () => {
      const response = await fetch('http://localhost:3001/product-statistics');
      const data = await response.json();
      setStatistics(data);
    };

    fetchStatistics();
  }, []);

  return (
    <div className="product-statistics">
      <h1>Thống Kê Sản Phẩm Theo Loại và Doanh Thu</h1>
      <div className="statistics-table">
        <div className="statistics-header">
          <p>Loại Sản Phẩm</p>
          <p>Tháng</p>
          <p>Số Lượng Bán</p>
          <p>Doanh Thu</p>
        </div>
        {statistics.map((stat, index) => (
          <div key={index} className="statistics-row">
            <p>{stat.product_type}</p>
            <p>{stat.month}</p>
            <p>{stat.total_products_sold}</p>
            <p>{stat.total_revenue},000 VND</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductStatistics;
