const db = require('../models/firebase');
const crypto = require('crypto');
const Firestore = require('firebase/firestore');

exports.registerUser = async (req, res) => {
  const { username } = req.body;
  if (!username) {
    return res.status(400).json({ message: 'Se requiere el nombre de usuario.' });
  }

  try {
    const usersRef = Firestore.collection(db, 'users');
    const q = Firestore.query(usersRef, Firestore.where('username', '==', username));
    const snapshot = await Firestore.getDocs(q);
    if (!snapshot.empty) {
      return res.status(400).json({ message: 'Este usuario ya existe.' });
    }

    const api_key = crypto.randomBytes(16).toString('hex');
    const newUser = { username, api_key, products: [] };

    await Firestore.addDoc(usersRef, newUser);
    return res.status(201).json({ message: 'Usuario registrado correctamente', api_key });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const usersRef = Firestore.collection(db, 'users');
    const snapshot = await Firestore.getDocs(usersRef);
    const users = [];
    snapshot.forEach(docSnap => {
      users.push({ id: docSnap.id, ...docSnap.data() });
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const userRef = Firestore.doc(db, 'users', id);
    const userSnap = await Firestore.getDoc(userRef);
    if (!userSnap.exists()) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }
    res.json({ id: userSnap.id, ...userSnap.data() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username } = req.body;
    if (!username) {
      return res.status(400).json({ message: 'Se requiere el nombre de usuario.' });
    }
    const userRef = Firestore.doc(db, 'users', id);
    await Firestore.updateDoc(userRef, { username });
    res.json({ message: 'Usuario actualizado correctamente.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.patchUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    if (!updates || Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'Ingresar datos para el patch.' });
    }
    const userRef = Firestore.doc(db, 'users', id);
    await Firestore.updateDoc(userRef, updates);
    res.json({ message: 'Usuario modificado correctamente.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const userRef = Firestore.doc(db, 'users', id);
    await Firestore.deleteDoc(userRef);
    res.json({ message: 'Usuario eliminado correctamente.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
