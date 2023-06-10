let express = require("express") ;
let app = express();
app.use(express.json ());
app.use( function (req, res, next) {
res.header("Access-Control-Allow-Origin","*");
res.header( "Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE, HEAD");
res. header( "Access-Control-Allow-Headers", "Origin, x-Requested-With, Content-Type, Accept");
next();
});

var port = process.env.PORT || 2410

app.listen(port,()=>console.log(`Listening on port ${port}!`));

let {allData} = require("./data");

app.get("/shops",function(req,res){
    res.send(allData.shops);
});

app.get("/shops/:id",function(req,res){
    let id = req.params.id;
    let shop = allData.shops.find(s1=>s1.shopId==id);
    res.send(shop);
});

app.post("/shops",function(req,res){
    let body = req.body;
    let maxid = allData.shops.reduce((acc,curr)=>(curr.shopId >acc ? curr.shopId:acc),0);
    let newId = maxid+1;
    let newShop={shopId:newId,...body}
    allData.shops.push(newShop);
    res.send(newShop);
});

app.get("/products",function(req,res){
    res.send(allData.products);
});
app.get("/products/:id",function(req,res){
    let id = req.params.id;
    let product = allData.products.find(s1=>s1.productId==id);
    res.send(product);
});

app.post("/products",function(req,res){
    let body = req.body;
    let maxid = allData.products.reduce((acc,curr)=>(curr.productId >acc ? curr.productId:acc),0);
    let newId = maxid+1;
    let newProduct={productId:newId,...body}
    allData.products.push(newProduct);
    res.send(newProduct);
});

app.put("/products/:id",function(req,res){
    let id = req.params.id
    let body = req.body;
    let index = allData.products.findIndex(c1=>c1.productId==id);
    if(index>=0){
        let updateproduct= {productId:id, ...body};
        allData.products[index] = updateproduct;
        res.send(updateproduct);
    }
    else  res.status(404).send("No products found");
})

app.get("/purchases",function(req,res){
    let shop = req.query.shop;
    let product = req.query.product;
    let sort = req.query.sort;
    let arr1=allData.purchases;
  
    if(shop){
        let sid = shop.substring(2);
        arr1 = arr1.filter((p1)=>p1.shopId==sid);
    }
    if(product){
        let arrprod = product.split(",");
        arr1 = arr1.filter((p1)=>arrprod.find(a1=>a1.substring(2)==p1.productid));
    }
    if(sort==="QtyAsc") arr1.sort((c1,c2)=>c1.quantity-c2.quantity);
    if(sort==="QtyDesc") arr1.sort((c1,c2)=>c2.quantity-c1.quantity);
    if(sort==="ValueAsc") arr1.sort((c1,c2)=>c1.quantity*c1.price-c2.quantity*c2.price);
    if(sort==="ValueDesc") arr1.sort((c1,c2)=>c2.quantity*c2.price-c1.quantity*c1.price);
    res.send(arr1);
    
});


app.get("/purchases/shops/:id",function(req,res){
    let id = +req.params.id;
    let purchases = allData.purchases.filter(s1=>s1.shopId===id);
    let purchases1 = purchases.map((pu,index)=>{
        let prod = allData.products.find(p1=>p1.productId==pu.productid);
        let shop = allData.shops.find(p1=>p1.shopId==pu.shopId);
        return {...purchases[index],productName:prod.productName,name:shop.name};
        });
    res.send(purchases1);
});


app.get("/purchases/products/:id",function(req,res){
    let id = +req.params.id;
    let purchases = allData.purchases.filter(s1=>s1.productid===id);
    let purchases1 = purchases.map((pu,index)=>{
        let prod = allData.products.find(p1=>p1.productId==pu.productid);
        let shop = allData.shops.find(p1=>p1.shopId==pu.shopId);
        return {...purchases[index],productName:prod.productName,category:prod.category,description:prod.description,name:shop.name};
        });
    res.send(purchases1);
});


app.get("/totalPurchase/shop/:id",function(req,res){
    let id = +req.params.id;
    let purchases = allData.purchases.filter(p1=>p1.shopId===id);
    let products = allData.products;
    let shops = allData.shops;
    let all = {purchases,products,shops};
    res.send(all);

});

app.get("/totalPurchase/product/:id",function(req,res){
    let id = +req.params.id;
    let purchases = allData.purchases.filter(p1=>p1.productid===id);
    let products = allData.products;
    let shops = allData.shops;
    let all = {purchases,products,shops};
    res.send(all);
});

app.post("/purchases",function(req,res){
    let body = req.body;
    let maxid = allData.purchases.reduce((acc,curr)=>(curr.purchaseId >acc ? curr.purchaseId:acc),0);
    let newId = maxid+1;
    let newPurchase={id:newId,...body}
    allData.purchases.push(newPurchase);
    res.send(newPurchase);
});
