// backend/server.js - VERSÃO CORRIGIDA E ORGANIZADA

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Conexão ao MongoDB
mongoose.connect(process.env.DATABASE_URL)
  .then(() => console.log('Conectado ao MongoDB Atlas com sucesso!'))
  .catch((err) => console.error('Erro ao conectar ao MongoDB:', err));

// ===============================================
// 1. DEFINIÇÃO DOS SCHEMAS
// ===============================================

const departmentSchema = new mongoose.Schema({
    nome: { type: String, required: true, unique: true }
});

const userSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    nome: { type: String, required: true },
    cargo: { type: String, required: true },
    fotoUrl: String,
    position: { x: Number, y: Number },
    departamento: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
    gestor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

// ===============================================
// 2. CRIAÇÃO DOS MODELS
// ===============================================

const Department = mongoose.model('Department', departmentSchema);
const User = mongoose.model('User', userSchema);

// ===============================================
// 3. ROTAS DA API (ENDPOINTS)
// ===============================================

// --- Rotas de Departamentos ---

app.get('/api/departments', async (req, res) => {
    try {
        const departments = await Department.find().sort({ nome: 1 });
        res.json(departments);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar departamentos', error });
    }
});

app.post('/api/departments', async (req, res) => {
    const { nome } = req.body;
    if (!nome) return res.status(400).json({ message: 'O nome do departamento é obrigatório.' });
    
    try {
        const newDepartment = new Department({ nome });
        const savedDepartment = await newDepartment.save();
        res.status(201).json(savedDepartment);
    } catch (error) {
        res.status(400).json({ message: 'Erro ao criar departamento.', error });
    }
});

app.put('/api/departments/:id', async (req, res) => {
    try {
        const updatedDepartment = await Department.findByIdAndUpdate(req.params.id, { nome: req.body.nome }, { new: true });
        if (!updatedDepartment) return res.status(404).json({ message: 'Departamento não encontrado.' });
        res.json(updatedDepartment);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao atualizar departamento.', error });
    }
});

app.delete('/api/departments/:id', async (req, res) => {
    const departmentId = req.params.id;
    try {
        // Antes de apagar o departamento, remove a referência em todos os utilizadores
        await User.updateMany({ departamento: departmentId }, { $set: { departamento: null } });

        const deletedDepartment = await Department.findByIdAndDelete(departmentId);
        if (!deletedDepartment) return res.status(404).json({ message: 'Departamento não encontrado.' });
        
        res.json({ message: 'Departamento apagado com sucesso e referências atualizadas.' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao apagar departamento.', error });
    }
});


// --- Rotas de Utilizadores ---

app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find().populate('departamento').populate('gestor');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar usuários', error });
    }
});

app.post('/api/users', async (req, res) => {
    try {
        const newUser = new User(req.body);
        const savedUser = await newUser.save();
        res.status(201).json(savedUser);
    } catch (error) {
        res.status(400).json({ message: 'Erro ao criar usuário', error });
    }
});

app.put('/api/users/:id', async (req, res) => {
    try {
        const updatedUser = await User.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
        if (!updatedUser) return res.status(404).json({ message: 'Usuário não encontrado' });
        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao atualizar usuário', error });
    }
});

app.delete('/api/users/:id', async (req, res) => {
    const userIdToDelete = req.params.id;
    try {
        // Encontra o _id do utilizador a ser apagado
        const userToDelete = await User.findOne({ id: userIdToDelete });
        if (!userToDelete) return res.status(404).json({ message: 'Usuário não encontrado' });

        // Remove a referência a este utilizador como gestor noutros utilizadores
        await User.updateMany({ gestor: userToDelete._id }, { $set: { gestor: null } });

        // Apaga o utilizador
        const deletedUser = await User.findOneAndDelete({ id: userIdToDelete });
        if (!deletedUser) return res.status(404).json({ message: 'Usuário não encontrado' }); // Verificação dupla por segurança
        
        res.json({ message: 'Usuário apagado com sucesso e referências de gestor atualizadas.' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao apagar usuário', error });
    }
});

// ===============================================
// 4. INICIAR O SERVIDOR
// ===============================================

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});