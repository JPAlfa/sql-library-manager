const express = require('express');
const Book = require('../models').Book;
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

// Create new router
const router = express.Router();

// Books per page limit
const limit = 10;

// Calculate what the offset should be for pagination
const calculateOffset = (pageNum) => {
    if (pageNum === undefined || pageNum <= 1) {
        return 0;
    } else {
        return (pageNum - 1) * limit;
    }
};

// GET the full list of books
router.get('/', (req, res) => {

    let currentPage = req.query.page;
    if (currentPage === undefined) {
        currentPage = '1';
    }
    const offset = calculateOffset(currentPage);

    // Get all of the books
    Book.findAndCountAll({ 
            order: [["title", "ASC"]],
            offset,
            limit
        })
        .then((books) => {
            res.render('index', {
                books: books.rows,
                numOfPages: Math.ceil(books.count / limit),
                currentPage
            });
        })
        .catch((err) => {
            res.sendStatus(500);
        });
});

// POST search the books
router.post('/', (req, res) => {

    const search = req.body.search;

    // Get the books that match the search
    Book.findAll({ 
            where: {
                [Op.or]: [
                    {
                        title: {
                            [Op.like]: `%${search}%`
                        }
                    },
                    {
                        author: {
                            [Op.like]: `%${search}%`
                        }
                    },
                    {
                        genre: {
                            [Op.like]: `%${search}%`
                        }
                    },
                    {
                        year: {
                            [Op.like]: `%${search}%`
                        }
                    }
                ]
            }
        })
        .then((books) => {
            if (books.length > 0) {
                res.render('index', { books });
            } else {
                res.render('no-results');
            }
        })
        .catch((err) => {
            res.sendStatus(500);
        });
});

// Export router
module.exports = router;