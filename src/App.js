// src/App.js - FASE DE AUTOLAYOUT COM DAGRE
import React, { useState, useEffect, useCallback } from 'react';
import ReactFlow, { MiniMap, Controls, Background, addEdge, useNodesState, useEdgesState, Handle, Position } from 'reactflow';
import 'reactflow/dist/style.css';
import './App.css';
import axios from 'axios';
import dagre from 'dagre'; // 1. Importar o Dagre

import UserModal from './UserModal';
import './UserModal.css';
import DepartmentModal from './DepartmentModal';
import './DepartmentModal.css';

// 2. Definir dimensões fixas para os nós para o cálculo do layout
const nodeWidth = 220;
const nodeHeight = 100;

// 3. Função para calcular o layout com Dagre
const getLayoutedElements = (nodes, edges) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  // Configurações do layout: 'TB' = Top to Bottom (de cima para baixo)
  dagreGraph.setGraph({ rankdir: 'TB', nodesep: 70, ranksep: 70 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    // O Dagre calcula a posição do centro do nó, ajustamos para o canto superior esquerdo que o React Flow usa
    node.position = {
      x: nodeWithPosition.x - nodeWidth / 2,
      y: nodeWithPosition.y - nodeHeight / 2,
    };
  });

  return { nodes, edges };
};


const CustomNode = ({ data }) => {
  // ... (Componente CustomNode permanece igual)
};
const DepartmentNode = ({ data }) => {
  // ... (Componente DepartmentNode permanece igual)
};

const nodeTypes = { custom: CustomNode, department: DepartmentNode };
const initialFormState = { id: null, _id: null, nome: '', cargo: '', departamento: '', gestor: '', email: '', skills: [], projetos: [], status: 'Disponível' };

function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [formData, setFormData] = useState(initialFormState);
  const [departments, setDepartments] = useState([]);
  const [isDepartmentModalOpen, setIsDepartmentModalOpen] = useState(false);
  const [allUsers, setAllUsers] = useState([]);

  const fetchAllData = useCallback(async () => {
    try {
      const [usersRes, deptsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/users'),
        axios.get('http://localhost:5000/api/departments')
      ]);
      
      const users = usersRes.data;
      const departmentsData = deptsRes.data;
      setAllUsers(users);
      setDepartments(departmentsData);

      const userNodes = users.map(user => ({
        id: user.id, _id: user._id, position: { x: 0, y: 0 }, // Posição inicial (0,0) será recalculada
        data: {
          name: user.nome, label: user.cargo, photo: user.fotoUrl,
          departamentoNome: user.departamento?.nome,
          onEdit: () => handleOpenEditModal(user),
          onDelete: () => handleDelete(user.id),
        },
        type: 'custom',
      }));
      
      const departmentNodes = departmentsData.map(dept => ({
        id: `dept-${dept._id}`, position: { x: 0, y: 0 }, // Posição inicial (0,0) será recalculada
        data: { name: dept.nome, gestorNome: dept.gestor?.nome },
        type: 'department',
      }));

      const allInitialNodes = [...userNodes, ...departmentNodes];
      
      const newEdges = [];
      departmentsData.forEach(dept => {
        if (dept.gestor) {
          newEdges.push({
            id: `edge-${dept.gestor.id}-to-dept-${dept._id}`, source: dept.gestor.id, target: `dept-${dept._id}`,
            type: 'smoothstep', style: { stroke: '#ff8c00' },
          });
        }
      });
      users.forEach(user => {
        if (user.departamento) {
           newEdges.push({
            id: `edge-dept-${user.departamento._id}-to-${user.id}`, source: `dept-${user.departamento._id}`, target: user.id,
            type: 'smoothstep', style: { stroke: '#00aaff' },
          });
        } else if (user.gestor) {
          newEdges.push({
            id: `edge-${user.gestor.id}-to-${user.id}`, source: user.gestor.id, target: user.id,
            animated: true, type: 'smoothstep', style: { stroke: '#cccccc' },
          });
        }
      });

      // 4. Chamar a função de layout antes de definir o estado
      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
        allInitialNodes,
        newEdges
      );

      setNodes(layoutedNodes);
      setEdges(layoutedEdges);

    } catch (error) {
      console.error("Erro ao buscar dados:", error);
      alert("Não foi possível carregar os dados da API. Verifique se o backend está a correr.");
    }
  }, []);

  useEffect(() => { fetchAllData(); }, [fetchAllData]);

  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), []);

  const handleOpenEditModal = (user) => {
    // ... (Esta função permanece igual)
  };
  
  const handleOpenCreateModal = () => { setFormData(initialFormState); setIsUserModalOpen(true); };
  const handleCloseUserModal = () => setIsUserModalOpen(false);
  
  const handleSave = async () => {
    const isEditing = formData.id;
    const payload = {
      nome: formData.nome, cargo: formData.cargo, email: formData.email,
      departamento: formData.departamento || null, gestor: formData.gestor || null,
      skills: formData.skills.filter(s => s), projetos: formData.projetos.filter(p => p),
      status: formData.status
    };

    try {
      if (isEditing) {
        await axios.put(`http://localhost:5000/api/users/${formData.id}`, payload);
      } else {
        const uniqueId = formData.nome.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
        // 5. REMOVER a posição hardcoded ao criar um novo utilizador. O layout cuidará disso.
        const newUserPayload = { ...payload, id: uniqueId, fotoUrl: `https://i.pravatar.cc/150?u=${uniqueId}` };
        await axios.post('http://localhost:5000/api/users', newUserPayload);
      }
      fetchAllData();
      handleCloseUserModal();
    } catch (error) { console.error(error); alert(`Erro: ${error.response?.data?.message || error.message}`); }
  };

  const handleDelete = async (userId) => {
    // ... (Esta função permanece igual)
  };
  
  // Funções de Departamento
  const handleAddDepartment = async (data) => { try { await axios.post('http://localhost:5000/api/departments', data); fetchAllData(); } catch (e) { console.error(e); alert("Erro."); }};
  const handleUpdateDepartment = async (id, data) => { try { await axios.put(`http://localhost:5000/api/departments/${id}`, data); fetchAllData(); } catch (e) { console.error(e); }};
  const handleDeleteDepartment = async (id) => { if (window.confirm("Tem a certeza?")) { try { await axios.delete(`http://localhost:5000/api/departments/${id}`); fetchAllData(); } catch (e) { console.error(e); } }};

  return (
    <div style={{ height: '100vh', width: '100%', backgroundColor: '#121212' }}>
      <div className="add-button-container">
        <button onClick={handleOpenCreateModal} className="btn-add">+ Adicionar Funcionário</button>
        <button onClick={() => setIsDepartmentModalOpen(true)} className="btn-manage">Gerir Departamentos</button>
      </div>
      <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect} nodeTypes={nodeTypes} fitView >
        <MiniMap /><Controls /><Background />
      </ReactFlow>
      {isUserModalOpen && ( <UserModal isOpen={isUserModalOpen} onClose={handleCloseUserModal} onSave={handleSave} formData={formData} setFormData={setFormData} departments={departments} users={allUsers} /> )}
      {isDepartmentModalOpen && ( <DepartmentModal isOpen={isDepartmentModalOpen} onClose={() => setIsDepartmentModalOpen(false)} departments={departments} onAdd={handleAddDepartment} onUpdate={handleUpdateDepartment} onDelete={handleDeleteDepartment} users={allUsers} /> )}
    </div>
  );
}

export default App;