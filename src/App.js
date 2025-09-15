// src/App.js - VERSÃO FINALÍSSIMA E CORRIGIDA

import React, { useState, useEffect, useCallback } from 'react';
import ReactFlow, { MiniMap, Controls, Background, addEdge, useNodesState, useEdgesState } from 'reactflow';
import 'reactflow/dist/style.css';
import './App.css';
import axios from 'axios';
import UserModal from './UserModal';
import './UserModal.css';
import DepartmentModal from './DepartmentModal';
import './DepartmentModal.css';

const CustomNode = ({ data }) => {
  const onEditClick = (evt) => { evt.stopPropagation(); data.onEdit(); };
  const onDeleteClick = (evt) => { evt.stopPropagation(); data.onDelete(); };
  return ( <div className="custom-node"> <img src={data.photo || 'https://i.pravatar.cc/50'} alt={data.name} className="node-photo" /> <div className="node-info"> <strong>{data.name}</strong> <span>{data.label}</span> <span className="node-department">{data.departamentoNome || 'Sem Depto.'}</span> </div> <div className="node-actions"> <button onClick={onEditClick} title="Editar">✏️</button> <button onClick={onDeleteClick} title="Apagar">🗑️</button> </div> </div> );
};

const nodeTypes = { custom: CustomNode };
const initialFormState = { id: null, _id: null, nome: '', cargo: '', departamento: null, gestor: null };

function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [formData, setFormData] = useState(initialFormState);
  const [departments, setDepartments] = useState([]);
  const [isDepartmentModalOpen, setIsDepartmentModalOpen] = useState(false);

  const fetchAllData = useCallback(async () => {
    try {
      const [usersRes, deptsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/users'),
        axios.get('http://localhost:5000/api/departments')
      ]);

      const users = usersRes.data;
      const depts = deptsRes.data;
      setDepartments(depts);

      const userMap = new Map(users.map(u => [u._id.toString(), u.id]));

      // DEBUG 1: MOSTRAR TODAS AS CHAVES QUE ESTÃO NO MAPA
      console.log("CHAVES NO MAPA:", Array.from(userMap.keys()));

      const formattedNodes = users.map(user => ({
        id: user.id,
        _id: user._id,
        position: user.position || { x: Math.random() * 500, y: Math.random() * 500 },
        data: {
          name: user.nome,
          label: user.cargo,
          photo: user.fotoUrl,
          departamentoNome: user.departamento?.nome,
          onEdit: () => handleOpenEditModal(user),
          onDelete: () => handleDelete(user.id),
        },
        type: 'custom',
      }));

      const formattedEdges = users
        .filter(user => user.gestor)
        .map(user => {
          // DEBUG 2: MOSTRAR O ID DE GESTOR QUE ESTAMOS A PROCURAR
          console.log(`Para ${user.nome}, a procurar pelo gestor com _id:`, user.gestor._id.toString());

          const sourceId = userMap.get(user.gestor._id.toString());

          return {
            id: `edge-${user.id}-to-${sourceId}`,
            source: sourceId,
            target: user.id,
            animated: true,
            type: 'smoothstep',
          };
        });

      setNodes(formattedNodes);
      setEdges(formattedEdges);

    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    }
  }, [setNodes, setEdges]); // Removi dependências desnecessárias para simplificar

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);
  const handleOpenEditModal = (user) => { setFormData({ id: user.id, _id: user._id, nome: user.nome, cargo: user.cargo, departamento: user.departamento?._id, gestor: user.gestor?._id, }); setIsUserModalOpen(true); };
  const handleOpenCreateModal = () => { setFormData(initialFormState); setIsUserModalOpen(true); };
  const handleCloseUserModal = () => setIsUserModalOpen(false);
  const handleSave = async () => { const isEditing = formData.id; const payload = { nome: formData.nome, cargo: formData.cargo, departamento: formData.departamento || null, gestor: formData.gestor || null }; try { if (isEditing) { await axios.put(`http://localhost:5000/api/users/${formData.id}`, payload); } else { const newUserPayload = { ...payload, id: formData.nome.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(), position: { x: 150, y: 150 }, fotoUrl: `https://i.pravatar.cc/150?u=${formData.nome}` }; await axios.post('http://localhost:5000/api/users', newUserPayload); } fetchAllData(); handleCloseUserModal(); } catch (error) { console.error("Erro ao salvar utilizador:", error); } };
  const handleDelete = async (userId) => { if (window.confirm("Tem a certeza?")) { try { await axios.delete(`http://localhost:5000/api/users/${userId}`); fetchAllData(); } catch (e) { console.error(e); } } };
  const handleAddDepartment = async (name) => { try { await axios.post('http://localhost:5000/api/departments', { nome: name }); fetchAllData(); } catch (e) { console.error(e); alert("Erro."); }};
  const handleUpdateDepartment = async (id, newName) => { try { await axios.put(`http://localhost:5000/api/departments/${id}`, { nome: newName }); fetchAllData(); } catch (e) { console.error(e); }};
  const handleDeleteDepartment = async (id) => { if (window.confirm("Tem a certeza?")) { try { await axios.delete(`http://localhost:5000/api/departments/${id}`); fetchAllData(); } catch (e) { console.error(e); } }};

  return (
    <div style={{ height: '100vh', width: '100%', backgroundColor: '#121212' }}>
      <div className="add-button-container"> <button onClick={handleOpenCreateModal} className="btn-add">+ Adicionar Funcionário</button> <button onClick={() => setIsDepartmentModalOpen(true)} className="btn-manage">Gerir Departamentos</button> </div>
      <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect} nodeTypes={nodeTypes} fitView >
        <MiniMap /><Controls /><Background />
      </ReactFlow>
      {isUserModalOpen && ( <UserModal isOpen={isUserModalOpen} onClose={handleCloseUserModal} onSave={handleSave} formData={formData} setFormData={setFormData} departments={departments} users={nodes} /> )}
      {isDepartmentModalOpen && ( <DepartmentModal isOpen={isDepartmentModalOpen} onClose={() => setIsDepartmentModalOpen(false)} departments={departments} onAdd={handleAddDepartment} onUpdate={handleUpdateDepartment} onDelete={handleDeleteDepartment} /> )}
    </div>
  );
}

export default App;