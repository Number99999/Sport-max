const port = 3001;
const express = require("express");
const app = express();
const moongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const {error} = require("console");
const {ppid} = require("process");
const {type} = require("os");
const {default: mongoose} = require("mongoose");
const dotenv = require('dotenv');
const payOS = require('./utils/payos');

dotenv.config();

app.use(express.json());
app.use(cors());

moongoose.connect("mongodb://127.0.0.1:27017/Sport-Max")


// Api Creation

app.get("/", (req, res) => {
    res.send("Express app is running")
})

// Image sotrage engine
const storage = multer.diskStorage({
    destination: './upload/images',
    filename: (req, file, cb) => {
        return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
    }
});

const upload = multer({storage: storage})
// Schema for create product

const Product = moongoose.model("Product", {
    id: {
        type: Number,
        require: true,
    },
    name: {
        type: String,
        require: true,

    },
    category: {
        type: [String],
        require: true,
    },
    product_type: {
        type: String,
        require: true,
    },
    image: {
        type: String,
        require: true,
    },
    new_price: {
        type: Number,
        require: true,
    },
    old_price: {
        type: Number,
        require: true,
    },
    size: {
        type: [String],
        require: true,
    },
    color: {
        type: [String],
        require: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    avilable: {
        type: Boolean,
        default: true,
    }
})

app.post('/addproduct', async (req, res) => {
    let products = await Product.find({});
    let id;
    if (products.length > 0) {
        let last_product_array = products.slice(-1);
        let last_product = last_product_array[0];
        id = last_product.id + 1;
    } else {
        id = 1;

    }
    const product = new Product({
        id: id,
        name: req.body.name,
        image: req.body.image,
        category: req.body.category,
        product_type: req.body.product_type,
        new_price: req.body.new_price,
        old_price: req.body.old_price,
        size: req.body.size,
        color: req.body.color,
    });
    console.log(product);
    await product.save();
    console.log("Save");
    res.json({
        success: true,
        name: req.body.name,
    })
})

// Create Upload
app.use('/images', express.static('upload/images'))
app.post("/upload", upload.single('product'), (req, res) => {
    res.json({
        success: 1,
        image_url: `http://localhost:${port}/images/${req.file.filename}`,
    })
})

//Creating API for deleting Products

app.post('/removeproduct', async (req, res) => {
    await Product.findOneAndDelete({id: req.body.id});
    console.log("removed");
    res.json({
        success: true,
        name: req.body.name,
    })
})

// Creating API for getting all Product

app.get('/allproducts', async (req, res) => {
    let products = await Product.find({});
    console.log("All product");
    res.send(products);

})

// Shema creating for User model
const Users = mongoose.model('Users', {
    username: {
        type: String,
    },
    email: {
        type: String,
        unique: true,
    },
    password: {
        type: String,
    },
    cartData: {
        type: Object,
    },
    date: {
        type: Date,
        default: Date.now,
    },
});

// Creating Endpoint for registering the user
app.post('/signup', async (req, res) => {
    let check = await Users.findOne({email: req.body.email})
    if (check) {
        return res.status(400).json({success: false, errors: "Email bạn sử dụng đã tồn tại!!!"});
    }
    let cart = {};
    for (let i = 0; i < 300; i++) {
        cart[i] = 0;
    }
    const user = new Users({
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
        cartData: cart,
    })

    await user.save();

    const data = {
        user: {
            id: user.id,
        }
    }

    const token = jwt.sign(data, 'secret_ecom');
    res.json({
        success: true,
        token,
    })
})

// Creating endpoint for user login
app.post('/login', async (req, res) => {
    let user = await Users.findOne({email: req.body.email});
    if (user) {
        const passCompare = req.body.password === user.password;
        if (passCompare) {
            const data = {
                user: {
                    id: user.id,
                }
            }
            const token = jwt.sign(data, 'secret_ecom');
            res.json({
                success: true,
                token,
            })
        } else {
            res.json({success: false, error: "Mật khẩu không đúng!!!"})
        }
    } else {
        res.json({success: false, error: "Tài khoản không tồn tại!!!"})
    }
})

// Creating endpoint for newcollection data
app.get('/newcollections', async (req, res) => {
    let products = await Product.find({});
    let newcollection = products.slice(1).slice(-8);
    console.log("Newcollection Fetched");
    res.send(newcollection);
})

// // Creating endpoint for popular in women section
// app.get('/popularinproducts', async(req, res) => {
//     //Cần sửa chỗ này
//     let products = await Product.find({category: "women"});
//     let popular_in_products =products.slice(0, 4);
//     console.log("Popular in products fetched");
//     res.send(popular_in_products);
// })

// Creating endpoint for popular in women and men sections
app.get('/popularinproducts', async (req, res) => {
    try {
        let products = await Product.find({
            $or: [
                {category: {$in: ["women"]}},
                {category: {$in: ["men"]}}
            ]
        });
        let popular_in_products = products.slice(0, 4);  // Lấy 4 sản phẩm đầu tiên
        console.log("Popular in products fetched");
        res.send(popular_in_products);
    } catch (error) {
        console.error("Error fetching popular products:", error);
        res.status(500).send("Internal Server Error");
    }
});

// creating middeware to fetch user
const fetchUser = async (req, res, next) => {
    const token = req.header('auth-token');
    if (!token) {
        res.status(401).send({errors: "Vui lòng xác thực bằng mã thông báo hợp lệ!!!"});
    } else {
        try {
            const data = jwt.verify(token, 'secret_ecom');
            req.user = data.user;
            next();
        } catch (error) {
            res.status(401).send({errors: "Vui lòng xác thực bằng mã thông báo hợp lệ!!!"})
        }
    }
}

// creating endpoint for adding products in cartdata
app.post('/addtocart', fetchUser, async (req, res) => {
    // console.log(req.body, req.user);
    console.log("Added", req.body.itemId);
    let userData = await Users.findOne({_id: req.user.id});
    userData.cartData[req.body.itemId] += 1;
    await Users.findOneAndUpdate({_id: req.user.id}, {cartData: userData.cartData});
    res.send("Added");
})

// creating endpoint for removing products in cartdata  
app.post('/removefromcart', fetchUser, async (req, res) => {
    console.log("Removed", req.body.itemId);
    let userData = await Users.findOne({_id: req.user.id});
    if (userData.cartData[req.body.itemId] > 0)
        userData.cartData[req.body.itemId] -= 1;
    await Users.findOneAndUpdate({_id: req.user.id}, {cartData: userData.cartData});
    res.send("Removed");
})

// creating endpoint for removing all products in cartdata  
app.post('/removeallfromcart', fetchUser, async (req, res) => {
    try {
        console.log("Removing all quantity of", req.body.itemId);
        let userData = await Users.findOne({_id: req.user.id});

        // Kiểm tra nếu sản phẩm tồn tại trong giỏ hàng
        if (userData.cartData[req.body.itemId] !== undefined) {
            userData.cartData[req.body.itemId] = 0; // Đặt số lượng sản phẩm về 0

            await Users.findOneAndUpdate({_id: req.user.id}, {cartData: userData.cartData});
            res.send({message: "Set product quantity to 0"});
        } else {
            res.status(400).json({error: "Item not found in cart"});
        }
    } catch (error) {
        res.status(500).json({error: "Error setting product quantity to 0"});
    }
});

app.post('/delete-cart', fetchUser, async (req, res) => {
    try{
        let userData = await Users.findOne({_id: req.user.id});
        if (userData.cartData) {
            for (let key in userData.cartData) {
                userData.cartData[key] = 0;
            }
            await Users.findOneAndUpdate({_id: req.user.id}, {cartData: userData.cartData});
            res.send({message: "Cart deleted successfully"});
        } else {
            res.status(400).json({error: "not found"});
        }
    } catch (e){
        res.status(500).json({error: "ERROR"});
    }
})

app.post('/getcart', fetchUser, async (req, res) => {
    console.log("GetCart");
    let userData = await Users.findOne({_id: req.user.id});
    res.json(userData.cartData);
})

const OrderDetail = mongoose.model("OrderDetail", {
    orderId: {
        type: String,
        required: true,
        unique: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: true,
    },
    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
            min: 1,
        }
    }],
    amount: {
        type: Number,
        required: true,
    },
    shippingFee: {
        type: Number,
        required: true,
    },
    description: {
        type: String,
    },
    status: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
});

app.post("/order/create", fetchUser, async function (req, res) {
    const { description, returnUrl, cancelUrl, amount, items, shippingFee } = req.body;
    const body = {
        orderCode: Number(String(new Date().getTime()).slice(-6)),
        amount,
        shippingFee,
        items,
        description,
        cancelUrl,
        returnUrl
    };

    try {
        const paymentLinkRes = await payOS.createPaymentLink(body);

        let userData = await Users.findOne({_id: req.user.id});

        const newOrder = new OrderDetail({
          orderId: paymentLinkRes.orderCode,
          user: userData.id,
          items: items?.map(product => {
              return {
                  product: product?._id,
                  quantity: product?.quantity
              }
          }),
          amount: amount,
          shippingFee: shippingFee,
          description: description,
          status: 'pending',
        });

        await newOrder.save();

        return res.json({
            error: 0,
            message: "Success",
            data: {
                bin: paymentLinkRes.bin,
                checkoutUrl: paymentLinkRes.checkoutUrl,
                accountNumber: paymentLinkRes.accountNumber,
                accountName: paymentLinkRes.accountName,
                amount: paymentLinkRes.amount,
                description: paymentLinkRes.description,
                orderCode: paymentLinkRes.orderCode,
                qrCode: paymentLinkRes.qrCode,
            },
        });
    } catch (error) {
        console.log(error);
        return res.json({
            error: -1,
            message: "fail",
            data: null,
        });
    }
});

app.get("/order/:orderId", async function (req, res) {
    try {
        const order = await payOS.getPaymentLinkInformation(req.params.orderId);
        if (!order) {
            return res.json({
                error: -1,
                message: "failed",
                data: null,
            });
        }
        return res.json({
            error: 0,
            message: "ok",
            data: order,
        });
    } catch (error) {
        console.log(error);
        return res.json({
            error: -1,
            message: "failed",
            data: null,
        });
    }
});

app.get("/order-details", async (req, res) => {
    try {
        const orderDetails = await OrderDetail.find()
            .populate({
                path: "user",
                select: "-password -cartData"
            })
            .populate("items.product")
        return res.json({
            error: 0,
            message: "Success",
            data: orderDetails,
        });
    } catch (error) {
        console.log(error);
        return res.json({
            error: -1,
            message: "Failed to fetch order details",
            data: null,
        });
    }
});

app.put("/order-details/:orderId/status", async (req, res) => {
    const { orderId } = req.params;
    const { status } = req.body; // status: 'success' hoặc 'cancel'

    if (!['success', 'cancel'].includes(status)) {
        return res.status(400).json({
            error: -1,
            message: "Invalid status. Only 'success' or 'cancel' are allowed.",
            data: null,
        });
    }

    try {
        const orderDetail = await OrderDetail.findOneAndUpdate({ orderId: orderId}, { status }, { new: true });

        if (!orderDetail) {
            return res.status(404).json({
                error: -1,
                message: "Order not found",
                data: null,
            });
        }

        return res.json({
            error: 0,
            message: "Order status updated successfully",
            data: orderDetail,
        });
    } catch (error) {
        console.log(error);
        return res.json({
            error: -1,
            message: "Failed to update order status",
            data: null,
        });
    }
});

// Start server
app.listen(port, (error) => {
    if (!error) {
        console.log("server is running on port: " + port)
    } else {
        console.log("Error:" + error)
    }
});

