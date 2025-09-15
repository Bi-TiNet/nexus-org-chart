// 1. Importar as bibliotecas necessárias
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config(); // Carrega as variáveis do arquivo .env

// 2. Inicializar o aplicativo Express
const app = express();
const PORT = process.env.PORT || 5000;

// 3. Configurar Middlewares
app.use(cors()); // Permite requisições de outros domínios (nosso frontend)
app.use(express.json()); // Permite que o servidor entenda JSON

// 4. Conectar ao MongoDB Atlas
mongoose.connect(process.env.DATABASE_URL)
  .then(() => console.log('Conectado ao MongoDB Atlas com sucesso!'))
  .catch((err) => console.error('Erro ao conectar ao MongoDB:', err));


const userSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    nome: { type: String, required: true },
    cargo: { type: String, required: true },
    fotoUrl: String,
    position: { x: Number, y: Number },
    departamento: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
    gestor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

// 6. Criar o Model a partir do Schema
const User = mongoose.model('User', userSchema);

// =================================================================
//  INÍCIO DO BLOCO DE DEPARTAMENTOS - COLE ESTE CÓDIGO
// =================================================================

// 5.1 Definir o Schema dos Departamentos
const departmentSchema = new mongoose.Schema({
    nome: { type: String, required: true, unique: true }
});

// 6.1 Criar o Model a partir do Schema
const Department = mongoose.model('Department', departmentSchema);

// 7.1 Criar as Rotas da API para os Departamentos

// ROTA PARA BUSCAR TODOS OS DEPARTAMENTOS
app.get('/api/departments', async (req, res) => {
    try {
        const departments = await Department.find().sort({ nome: 1 }); // Ordena por nome
        res.json(departments);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar departamentos', error });
    }
});

// ROTA PARA ADICIONAR UM NOVO DEPARTAMENTO
app.post('/api/departments', async (req, res) => {
    const { nome } = req.body;
    if (!nome) {
        return res.status(400).json({ message: 'O nome do departamento é obrigatório.' });
    }
    const newDepartment = new Department({ nome });
    try {
        const savedDepartment = await newDepartment.save();
        res.status(201).json(savedDepartment);
    } catch (error) {
        res.status(400).json({ message: 'Erro ao criar departamento. Ele já pode existir.', error });
    }
});

// ROTA PARA EDITAR (RENOMEAR) UM DEPARTAMENTO
app.put('/api/departments/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nome } = req.body;
        const updatedDepartment = await Department.findByIdAndUpdate(id, { nome }, { new: true });
        if (!updatedDepartment) {
            return res.status(404).json({ message: 'Departamento não encontrado.' });
        }
        res.json(updatedDepartment);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao atualizar departamento.', error });
    }
});

// ROTA PARA APAGAR UM DEPARTAMENTO
app.delete('/api/departments/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deletedDepartment = await Department.findByIdAndDelete(id);
        if (!deletedDepartment) {
            return res.status(404).json({ message: 'Departamento não encontrado.' });
        }
        res.json({ message: 'Departamento apagado com sucesso.' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao apagar departamento.', error });
    }
});

// ROTA PARA BUSCAR TODOS OS USUÁRIOS
app.get('/api/users', async (req, res) => {
    try {
        // Adicionamos um segundo .populate() para trazer os dados do gestor junto
        const users = await User.find().populate('departamento').populate('gestor');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar usuários', error });
    }
});

// ROTA PARA ADICIONAR UM NOVO USUÁRIO
app.post('/api/users', async (req, res) => {
    const { id, nome, cargo, position } = req.body;
    const newUser = new User({ id, nome, cargo, position });

    try {
        const savedUser = await newUser.save();
        res.status(201).json(savedUser);
    } catch (error) {
        res.status(400).json({ message: 'Erro ao criar usuário', error });
    }
});

// ROTA PARA EDITAR (ATUALIZAR) UM USUÁRIO EXISTENTE (PUT)
app.put('/api/users/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        const updatedData = req.body;
        
        // Encontra o usuário pelo 'id' customizado e atualiza com os novos dados
        const updatedUser = await User.findOneAndUpdate({ id: userId }, updatedData, { new: true });

        if (!updatedUser) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }

        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao atualizar usuário', error });
    }
});

// ROTA PARA APAGAR UM USUÁRIO (DELETE)
app.delete('/api/users/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        
        // Encontra o usuário pelo 'id' customizado e o remove
        const deletedUser = await User.findOneAndDelete({ id: userId });

        if (!deletedUser) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }

        res.json({ message: 'Usuário apagado com sucesso' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao apagar usuário', error });
    }
});

// 8. Iniciar o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});