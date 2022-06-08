const express = require('express');
const bodyParser = require('body-parser');
const authenticate = require('../authenticate');
const Favorites = require('../models/favorites');
const cors = require('./cors');

const favoritesRouter = express.Router();

favoritesRouter.use(bodyParser.json());

favoritesRouter.route('/')
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: req.user})
    .populate('user')
    .populate('dishes')
    .then((fav)=>{
        if(fav != null){
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(fav); 
        }
        else{
            res.statusCode = 200;
            res.end('You have no favorites!');
        }
    }, (err)=> next(err))
    .catch((err)=> next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: req.user})
    .then((fav)=>{
        if(fav === null){
            fav = Favorites.create({user: req.user});
        }
        for(i of req.body){
            const dish = fav.dishes.find((d)=>{
                if(d._id.toString() === i._id.toString()){
                    return d;
                }
            });
            if(!dish){
                fav.dishes.push(i._id);                
            }
        }  
        fav.save();                 
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({success: true, status: 'All dishes added to favorites!'});

    }, (err)=> next(err))
    .catch((err)=> next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: req.user})
    .then((fav)=>{
        if(fav != null){
            for(i of req.body){
                fav.dishes =  fav.dishes.filter((d) => d._id.toString() !== i._id.toString());  
            }
            fav.save();            
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json({success: true, status: 'All dishes removed from favorites!'});
        }
        else{
            res.statusCode = 403;
            res.end('You have no favorites!');
        }

    }, (err)=> next(err))
    .catch((err)=> next(err));
});



favoritesRouter.route('/:dishId')
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('GET operation not supported on /favorites/' + req.params.dishId);
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: req.user})
    .then((fav)=>{
        if(fav === null){
            fav = Favorites.create({user: req.user});
        }
        const dish = fav.dishes.find((d)=>{
            if(d._id.toString() === req.params.dishId.toString()){
                return d;
            }
        });
        if(!dish){
            fav.dishes.push(req.params.dishId);
            fav.save();            
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json({success: true, status: 'Dish added to favorites!'});
        }
        else{
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json({success: true, status: 'This dish is already added to favorites!'});
        }

    }, (err)=> next(err))
    .catch((err)=> next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites/' + req.params.dishId);
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: req.user})
    .then((fav)=>{
        if(fav != null){
            const dish = fav.dishes.find((d)=>{
                if(d._id.toString() === req.params.dishId.toString()){
                    return d;
                }
            });
            if(dish){
                fav.dishes =  fav.dishes.filter((d) => d._id.toString() !== req.params.dishId.toString());
                fav.save();            
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json({success: true, status: 'Dish removed from favorites!'});
            }
            else{
                res.statusCode = 403;
                res.end('This dish is not in your favorites!');
            }
        }
        else{
            res.statusCode = 403;
            res.end('You have no favorites!');
        }

    }, (err)=> next(err))
    .catch((err)=> next(err));
});

module.exports = favoritesRouter;