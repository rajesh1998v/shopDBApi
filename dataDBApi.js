let express = require("express") ;
let app = express();
app.use(express.json ());
app.use( function (req, res, next) {
res.header("Access-Control-Allow-Origin","*");
res.header( "Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE, HEAD");
res. header( "Access-Control-Allow-Headers", "Origin, x-Requested-With, Content-Type, Accept");
next();
});
var port = process.env.PORT || 2410;
app.listen(port,()=>console.log(`Listening on port ${port}!`));

const { Client } = require("pg");
const client = new Client({
    user: "postgres",
    password: "Rajesh8789kum@r",
    database: "postgres",
    port: 5432,
    host: "db.jycbwqbmmkcavrwqiqzi.supabase.co",
    ssl: { rejectUnauthorized: false },
});
client.connect(function (res, error) {
    console.log(`Connected!!!`);
});

app.get("/shops", function (req, res, next) {
    const query = "SELECT * FROM shops";
    client.query(query, function (err, result) {
        if (err) res.status(400).send(err);
         else res.send(result.rows);
    });
});

app.post("/shops", function (req, res, next) {
    let body = req.body;
    const query = "SELECT * FROM shops";
    client.query(query, function (err, result) {
        if(err)  res.status(400).send(err);
        else{
            let maxid = result.rows.reduce((acc,curr)=>acc.shopid>curr.shopid?acc:curr,0).shopid;
            let newId = maxid+1;
            let newShop = {shopid:newId,...body}
            let values = Object.values(newShop);
            const query = `INSERT INTO shops(shopid, name, rent) VALUES ($1,$2,$3)`;
            client.query(query, values, function (err, result) {
                if (err) res.status(400).send(err);
                else res.send(`${result.rowCount} insertion successful`);
            });
        }
    })
    
});


app.get("/products", function (req, res, next) {
    const query = "SELECT * FROM products";
    client.query(query, function (err, result) {
        if (err) res.status(400).send(err);
         else res.send(result.rows);
    });
});
app.get("/products/:id", function (req, res, next) {
    let id = +req.params.id;
    const query = "SELECT * FROM products where productid=$1";
    client.query(query,[id], function (err, result) {
        if (err) res.status(400).send(err);
         else res.send(result.rows);
    });
});

app.post("/products", function (req, res, next) {
    let body = req.body;
    const query = "SELECT * FROM products";
    client.query(query, function (err, result) {
        if(err)  res.status(400).send(err);
        else{
            let maxid = result.rows.reduce((acc,curr)=>acc.productid>curr.productid?acc:curr,0).productid;
            let newId = maxid+1;
            let newProduct = {productid:newId,...body}
            let values = Object.values(newProduct);
            const query = `INSERT INTO products(productid, productname, category,description) VALUES ($1,$2,$3,$4)`;
            client.query(query, values, function (err, result) {
                if (err) res.status(400).send(err);
                else res.send(`${result.rowCount} insertion successful`);
            });
        }
    })
    
});


app.put("/products/:id", function (req, res, next) {
    let id = +req.params.id;
    var values = Object.values(req.body);
    values.push(id);
    const query = `UPDATE products SET productid=$1, productname=$2, category=$3, description=$4 WHERE productid=$5`;
    client.query(query, values, function (err, result) {
        if (err)  res.status(400).send(err);
        else res.send(`updation successful`);
    });
});


app.get("/purchases", function (req, res, next) {
    let shop = req.query.shop;
    let product = req.query.product;
    let sort = req.query.sort;
    const query = "SELECT * FROM purchases";
    client.query(query, function (err, result) {
        if (err) res.status(400).send(err);
         else{
            let arr1 = result.rows;
            if(shop) {
                let sid = +shop.substring(2);
                arr1 = arr1.filter(p1=>p1.shopid===sid);
            }
            if(product){
                let arrprod = product.split(",");
                arr1 = arr1.filter((p1)=>arrprod.find(a1=>a1.substring(2)==p1.productid));
            }
            if(sort==="QtyAsc") arr1.sort((q1,q2)=>q1.quantity-q2.quantity);
            if(sort==="QtyDesc") arr1.sort((q1,q2)=>q2.quantity-q1.quantity);
            if(sort==="ValueAsc") arr1.sort((q1,q2)=>q1.quantity*q1.price-q2.quantity*q2.price);
            if(sort==="ValueDesc") arr1.sort((q1,q2)=>q2.quantity*q2.price-q1.quantity*q1.price);
            res.send(arr1);
         } 
    });
});

app.get("/purchases/shops/:id", function (req, res, next) {
    let id = +req.params.id;
    const query = "SELECT * FROM purchases INNER JOIN shops ON purchases.shopid=shops.shopid INNER JOIN products ON purchases.productid=products.productid where purchases.shopid=$1";
    client.query(query,[id], function (err, result) {
        if (err) res.status(400).send(err);
         else res.send(result.rows);
    });
});

app.get("/purchases/products/:id", function (req, res, next) {
    let id = +req.params.id;
    const query = "SELECT * FROM purchases INNER JOIN products ON purchases.productid=products.productid INNER JOIN shops ON purchases.shopid=shops.shopid where purchases.productid=$1";
    client.query(query,[id], function (err, result) {
        if (err) res.status(400).send(err);
         else res.send(result.rows);
    });
});

app.post("/purchases", function (req, res, next) {
    let body = req.body;
    const query = "SELECT * FROM purchases";
    client.query(query, function (err, result) {
        if(err)  res.status(400).send(err);
        else{
            let maxid = result.rows.reduce((acc,curr)=>acc>curr.purchaseid?acc:curr,0).purchaseid;
            let newId = maxid+1;
            let newpurchase = {purchaseid:newId,...body}
            let values = Object.values(newpurchase);
            console.log(values);
            const query = `INSERT INTO purchases(purchaseid,shopId, productid , quantity ,price ) VALUES ($1,$2,$3,$4,$5)`;
            client.query(query, values, function (err, result) {
                if (err) res.status(400).send(err);
                else res.send(`${result.rowCount} insertion successful`);
            });
        }
    })
    
});

app.get("/totalPurchase/shop/:id", function (req, res, next) {
    let id = +req.params.id;
    const query = "SELECT * FROM purchases where shopid=$1";
    client.query(query,[id], function (err, result) {
        if (err){ 
            res.status(400).send(err);
        } else{
            var purchases= result.rows;
            const query1 = "SELECT * FROM shops";
            client.query(query1, function (err, result) {
                if (err){res.status(400).send(err);} 
                else{ 
                    var shops=result.rows;
                    const query2 = "SELECT  * FROM products";
                client.query(query2, function (err, result) {
                if (err){res.status(400).send(err); } 
                else{  
                    var products=result.rows; 
                    let all = {purchases,products,shops};
                    res.send(all);
                    }
                });
                }
            });
        }
    });
   
});

app.get("/totalPurchase/product/:id", function (req, res, next) {
    let id = +req.params.id;
    const query = "SELECT  * FROM purchases where productid=$1";
    client.query(query,[id], function (err, result) {
        if (err){ 
            res.status(400).send(err);
        } else{
            var purchases= result.rows;
            const query1 = "SELECT * FROM shops";
            client.query(query1, function (err, result) {
                if (err){res.status(400).send(err);} 
                else{ 
                    var shops=result.rows;
                    const query2 = "SELECT * FROM products";
                client.query(query2, function (err, result) {
                if (err){res.status(400).send(err); } 
                else{  
                    var products=result.rows;
                    let all = {purchases,products,shops};
                    res.send(all);
                    }
                });
                }
            });
            
        }
    });
});
