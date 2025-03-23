const db = require('../models/firebase');
const Firestore = require('firebase/firestore');

exports.createProduct = async (req, res) => {
  try {
    const { api_key, product } = req.body;
    if (!api_key) {
      return res.status(400).json({ message: 'Se requiere una API Key' });
    }

    const usersRef = Firestore.collection(db, 'users');
    const q = Firestore.query(usersRef, Firestore.where('api_key', '==', api_key));
    const snapshot = await Firestore.getDocs(q);
    if (snapshot.empty) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const userDoc = snapshot.docs[0];
    const userRef = Firestore.doc(db, 'users', userDoc.id);

    await Firestore.updateDoc(userRef, {
      products: Firestore.arrayUnion(product)
    });

    res.status(201).json({ message: 'Producto agregado correctamente.', product });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    const { api_key } = req.query;
    if (!api_key) {
      return res.status(400).json({ message: 'Se requiere una API Key' });
    }

    const usersRef = Firestore.collection(db, 'users');
    const q = Firestore.query(usersRef, Firestore.where('api_key', '==', api_key));
    const snapshot = await Firestore.getDocs(q);
    if (snapshot.empty) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const userData = snapshot.docs[0].data();
    res.json(userData.products || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const { api_key } = req.query;
    const { id } = req.params; 
    if (!api_key) {
      return res.status(400).json({ message: 'Se requiere una API Key' });
    }
    
    const usersRef = Firestore.collection(db, 'users');
    const q = Firestore.query(usersRef, Firestore.where('api_key', '==', api_key));
    const snapshot = await Firestore.getDocs(q);
    if (snapshot.empty) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    const userData = snapshot.docs[0].data();
    const product = (userData.products || []).find(prod => prod.product_key === id);
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado.' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { api_key } = req.query;
    const { id } = req.params; 
    const { product: newProduct } = req.body;
    if (!api_key) {
      return res.status(400).json({ message: 'Se requiere una API Key' });
    }
    if (!newProduct) {
      return res.status(400).json({ message: 'Ingresar un nuevo producto' });
    }
    
    const usersRef = Firestore.collection(db, 'users');
    const q = Firestore.query(usersRef, Firestore.where('api_key', '==', api_key));
    const snapshot = await Firestore.getDocs(q);
    if (snapshot.empty) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    const userDoc = snapshot.docs[0];
    const userData = userDoc.data();
    const products = userData.products || [];
    const index = products.findIndex(prod => prod.product_key === id);
    if (index === -1) {
      return res.status(404).json({ message: 'Producto no encontrado.' });
    }
    
    products[index] = newProduct;
    const userRef = Firestore.doc(db, 'users', userDoc.id);
    await Firestore.updateDoc(userRef, { products });
    res.json({ message: 'Producto actualizado correctamente.', product: newProduct });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.patchProduct = async (req, res) => {
  try {
    const { api_key } = req.query;
    const { id } = req.params; 
    const { product: productUpdates } = req.body;
    if (!api_key) {
      return res.status(400).json({ message: 'Se requiere una API Key' });
    }
    if (!productUpdates) {
      return res.status(400).json({ message: 'Introducir informacion del producto.' });
    }
    
    const usersRef = Firestore.collection(db, 'users');
    const q = Firestore.query(usersRef, Firestore.where('api_key', '==', api_key));
    const snapshot = await Firestore.getDocs(q);
    if (snapshot.empty) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    const userDoc = snapshot.docs[0];
    const userData = userDoc.data();
    const products = userData.products || [];
    const index = products.findIndex(prod => prod.product_key === id);
    if (index === -1) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    
    const updatedProduct = { ...products[index], ...productUpdates };
    products[index] = updatedProduct;
    const userRef = Firestore.doc(db, 'users', userDoc.id);
    await Firestore.updateDoc(userRef, { products });
    res.json({ message: 'Producto actualizado correctamente', product: updatedProduct });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { api_key } = req.query;
    const { id } = req.params; 
    if (!api_key) {
      return res.status(400).json({ message: 'Se requiere una API Key' });
    }
    
    const usersRef = Firestore.collection(db, 'users');
    const q = Firestore.query(usersRef, Firestore.where('api_key', '==', api_key));
    const snapshot = await Firestore.getDocs(q);
    if (snapshot.empty) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    const userDoc = snapshot.docs[0];
    const userData = userDoc.data();
    const products = userData.products || [];
    const newProducts = products.filter(prod => prod.product_key !== id);
    if (newProducts.length === products.length) {
      return res.status(404).json({ message: 'Producto no encontrado.' });
    }
    
    const userRef = Firestore.doc(db, 'users', userDoc.id);
    await Firestore.updateDoc(userRef, { products: newProducts });
    res.json({ message: 'Producto eliminado correctamente.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
