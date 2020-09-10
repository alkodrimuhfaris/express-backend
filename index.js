const express = require ('express');
const app = express();
const db = require('./helper/db')
const qs = require('querystring')

app.use(express.static('public'));


let bodyParser = require('body-parser'); 
const { send } = require("process");

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());


app.post('/items', (req, res)=>{
    const {name, price, description} = req.body
    if(name&&price&&description){
        db.query(`INSERT INTO items (name, price, description) VALUE ('${name}',${price},'${description}')`, (err, result, field)=>{
            //if (error) throw err
            if(!err){
                res.status(201).send({
                    success: true,
                    message: 'item has been created',
                    data: req.body
                })
            }else{
                console.log(err);
                res.status(500).send({
                    success: false,
                    message: 'Internal Server Error'
                })
            }
        })
    }else{
        console.log(err)
        res.status(400).send({
            success: false,
            message: 'All field must be filled!'
        })
    }
})

app.get('/items', (req,res)=>{
    let {page, limit, search} = req.query
    let searchKey = ''
    let searchValue = ''
    if(typeof search === 'object'){
        searchKey = Object.keys(search) [0]
        searchValue = Object.values(search) [0]
    }else{
        searchKey = 'name'
        searchValue = search||''
    }
    if(!limit){
        limit = 5
    }else{
        limit=Number(limit)
    }
    if(!page){
        page=1
    }else{
        page=Number(page)
    }
    const offset = (page-1)*limit
    const query = `SELECT * FROM items WHERE ${searchKey} LIKE '%${searchValue}%' LIMIT ${limit} OFFSET ${offset}`
    console.log(query)
    db.query(query, (err, result, field)=>{
    console.log(result)
        if(!err){
            const pageInfo = {
                count: 0,
                pages: 1,
                currentPage: page,
                dataPerPage: limit,
                nextLink: null,
                prefLink: null,
            }
            if(result.length){
                const query = `SELECT COUNT(*) AS count FROM items WHERE ${searchKey} LIKE '%${searchValue}%'`
                console.log(query)
                db.query(query, (err, data, fields)=>{
                    console.log(data)
                    const {count} = data[0]
                    console.log(count)
                    pageInfo.count = count
                    pageInfo.pages = Math.ceil(count/limit)
                    const query = qs.parse(req.query)

                    const {pages, currentPage} = pageInfo

                    if(currentPage < pages){
                        pageInfo.nextLink=`http://localhost:8080/items?${qs.stringify({...req.query, ...{page: page+1}})}`
                    }
                    if(currentPage>1){
                        pageInfo.prefLink=`http://localhost:8080/items?${qs.stringify({...req.query, ...{page: page-1}})}`
                    }

                    res.status(201).send({
                        success: true,
                        message: 'List of items',
                        data: result,
                        pageInfo

                    })
                })
                
            }else{
                res.status(201).send({
                    success: true,
                    message: 'There is no item in the list',
                    pageInfo
                })
            }
        }else{
            console.log(err)
            res.status(500).send({
                sucess: false,
                message: 'Internal Server Error'
            })
        }
    })
})

//mereplace keseluruhan data dengan id tertentu
app.put('/items/:id', (req, res)=>{
    const {name, price, description} = req.body 
    db.query(`SELECT * FROM items WHERE id = ${req.params.id}`,(err0, result0, field0)=>{
        let oldData = result0[0];
        if (result0[0]){
            if(name&&Number(price)&&description){
                db.query(`UPDATE items SET name='${name}', price=${Number(price)}, description='${description}' WHERE id=${req.params.id}`, (err, result, field)=>{
                    if(!err){
                        res.status(201).send({
                            success: true,
                            oldData: oldData,
                            message: 'item has been updated',
                            newData: req.body
                        })
                    }else{
                        console.log(err);
                        res.status(500).send({
                            success: false,
                            message: 'Internal Server Error'
                        })
                    }
                })
            }else{
                res.status(201).send({
                    success: true,
                    choosenData: oldData,
                    message: 'There is no updates on data. All field must be filled with the correct data type!'
                })
            }
        }else{
            res.status(201).send({
                success: true,
                message: 'The id you choose is invalid!',
            })
        }
    })
}) 

//mengupdate sebagian dengan id tertentu
app.patch('/items/:id', (req, res)=>{
    const {name, price, description} = req.body
    db.query(`SELECT * FROM items WHERE id = ${req.params.id}`,(err0, result0, field0)=>{
        if (result0[0]){
            let oldData = result0[0];
            let fillName = '';
            let fillPrice = '';
            let fillDesc = '';
            let commaFirst = '';
            let commaSecond = '';
            if(name||Number(price)||description){
                if(name){
                    fillName =`name='${name}'`
                }
                if(Number(price)){
                    fillPrice = `price=${Number(price)}`
                }
                if(description){
                    fillDesc = `description='${description}'`
                }
                if (fillName&&fillPrice&&fillDesc){
                    commaFirst =',';
                    commaSecond =',';
                }else if (fillName&&fillPrice&&!fillDesc || fillName&&!fillPrice&&fillDesc){
                    commaFirst = ',';
                }else if (!fillName&&fillPrice&&fillDesc){
                    commaSecond = ',';
                }
                db.query(`UPDATE items SET ${fillName}${commaFirst}${fillPrice}${commaSecond} ${fillDesc} WHERE id=${req.params.id}`, (err, result, field)=>{
                    if(!err){
                        const propertyUpdatted = {};
                        if(name){
                            propertyUpdatted.newName= name;
                        };
                        if(Number(price)){
                            propertyUpdatted.newPrice= price;
                        };
                        if(description){
                            propertyUpdatted.newDescription= description;
                        };
                        res.status(201).send({
                            success: true,
                            oldData: oldData,
                            message: `Your item's property has been updated`,
                            propertyUpdatted
                        })
                    }else{
                        console.log(err);
                        res.status(500).send({
                            success: false,
                            message: 'Internal Server Error'
                        })
                    }
                })
            }else{
                res.status(201).send({
                    success: true,
                    choosenData: oldData,
                    message: 'There is No Change on Choosen Data!'
                })
            }
        }else{
            res.status(201).send({
                success: true,
                message: 'The id you choose is invalid!',
            })
        }
    })
}) 

//mendelete data dengan id tertentu
app.delete('/items/:id', (req, res)=>{
    db.query(`SELECT * FROM items WHERE id = ${req.params.id}`,(err0, result0, field0)=>{
        let selectedData = result0[0]
        if (result0[0]){   
            db.query(`DELETE FROM items WHERE id = ${req.params.id}`, (err, result, field)=>{
                if(!err){
                    res.status(201).send({
                        success: true,
                        message: `Item with id ${req.params.id} has been selected`,
                        selectedData
                    })
                }else{
                    console.log(err);
                    res.status(500).send({
                        success: false,
                        message: 'Internal Server Error'
                    })
                }
            })
        }else {
            res.status(201).send({
                success: true,
                message: 'The id you choose is invalid!',
            })
        }

    })
}) 

//menampilkan data dengan id tertentu
app.get('items/:id', (req, res)=>{
    db.query(`SELECT * FROM items WHERE id = ${req.params.id}`,(err0, result0, field0)=>{
        let choosenData = result0[0]
        if (result0[0]){   
            if(!err){
                res.status(201).send({
                    success: true,
                    message: `Item ${deletedData.name} on id ${req.params.id} has been deleted`
                })
            }else{
                console.log(err);
                res.status(500).send({
                    success: false,
                    message: 'Internal Server Error'
                })
            }
        }else {
            res.status(201).send({
                success: true,
                message: 'The id you choose is invalid!',
            })
        }

    })
}) 


app.listen(8080, ()=> {
    console.log('App listening on port 8080')
})

// nama repo: express-backend