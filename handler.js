/* eslint-disable import/no-extraneous-dependencies */
const { nanoid } = require('nanoid');

const books = require('./books');

const addBookHandler = (request, h) => {
  const {
    name = null,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    reading,
  } = request.payload;

  const id = nanoid(16);
  let finished = false;
  if (readPage === pageCount) {
    finished = true;
  }
  const insertedAt = new Date().toISOString();
  const updatedAt = insertedAt;

  const newBook = {
    id,
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    finished,
    reading,
    insertedAt,
    updatedAt,
  };

  /** Check if property name is not declared on the body request then fail */
  if (name === null) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal menambahkan buku. Mohon isi nama buku',
    });
    response.code(400);
    return response;
  }

  /** Check if readPage grater than pageCount then fail */
  if (readPage > pageCount) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount',
    });
    response.code(400);
    return response;
  }

  /** If object pass all the exception then insert the book */
  books.push(newBook);
  const inserted = books.filter((book) => book.id === id).length > 0;
  if (inserted) {
    const response = h.response({
      status: 'success',
      message: 'Buku berhasil ditambahkan',
      data: {
        bookId: id,
      },
    });
    response.code(201);
    return response;
  }

  const response = h.response({
    status: 'fail',
    message: 'Gagal menambah buku',
  });
  response.code(500);
  return response;
};

const getAllBooksHandler = (request, h) => {
  /** Get the query parametery, then set null if the data not declared */
  const { name = null, reading = null, finished = null } = request.query;

  let filteredBooks = [];
  if (books) {
    /** Proceed the query parameters */
    let filterData = books;
    if (name !== null) {
      /** search book by name that contains ${name} value, non-case sensitive */
      filterData = books.filter((book) => book.name.toLowerCase().includes(name.toLowerCase()));
    }
    if (reading !== null) {
      /** search book by reading status */
      const check = parseInt(reading, 10);
      filterData = books.filter((book) => book.reading === (check === 1));
    }
    if (finished !== null) {
      /** search book by finished reading the book or not */
      const end = parseInt(finished, 10);
      filterData = books.filter((book) => book.finished === (end === 1));
    }

    /** Filter book only show id, name and publisher */
    filteredBooks = filterData.map((book) => (
      {
        id: book.id,
        name: book.name,
        publisher: book.publisher,
      }));
  }

  const response = h.response({
    status: 'success',
    data: {
      books: filteredBooks,
    },
  });
  response.code(200);
  return response;
};

const getBooksByIdHandler = (request, h) => {
  const { bookId } = request.params;

  const filteredBooks = books.filter((bk) => bk.id === bookId)[0];

  if (filteredBooks !== undefined) {
    const response = h.response({
      status: 'success',
      data: {
        book: filteredBooks,
      },
    });
    response.code(200);
    return response;
  }

  const response = h.response({
    status: 'fail',
    message: 'Buku tidak ditemukan',
  });
  response.code(404);
  return response;
};

const editBooksByIdHandler = (request, h) => {
  const { bookId } = request.params;
  const {
    name = null,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    reading,
  } = request.payload;

  const updatedAt = new Date().toISOString();

  if (name === null) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal memperbarui buku. Mohon isi nama buku',
    });
    response.code(400);
    return response;
  }

  if (readPage > pageCount) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount',
    });
    response.code(400);
    return response;
  }

  const idx = books.findIndex((book) => book.id === bookId);

  if (idx !== -1) {
    books[idx] = {
      ...books[idx],
      name,
      year,
      author,
      summary,
      publisher,
      pageCount,
      readPage,
      reading,
      updatedAt,
    };

    const response = h.response({
      status: 'success',
      message: 'Buku berhasil diperbarui',
    });
    response.code(200);
    return response;
  }

  const response = h.response({
    status: 'fail',
    message: 'Gagal memperbarui buku. Id tidak ditemukan',
  });
  response.code(404);
  return response;
};

const deleteBooksByIdHandler = (request, h) => {
  const { bookId } = request.params;

  const idx = books.findIndex((book) => book.id === bookId);

  if (idx !== -1) {
    books.splice(idx, 1);
    const response = h.response({
      status: 'success',
      message: 'Buku berhasil dihapus',
    });
    response.code(200);
    return response;
  }

  const response = h.response({
    status: 'fail',
    message: 'Buku gagal dihapus. Id tidak ditemukan',
  });
  response.code(404);
  return response;
};
module.exports = {
  addBookHandler,
  getAllBooksHandler,
  getBooksByIdHandler,
  editBooksByIdHandler,
  deleteBooksByIdHandler,
};
