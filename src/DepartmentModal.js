// src/DepartmentModal.js - CÓDIGO CORRIGIDO E MELHORADO
import React, { useState, useEffect } from 'react';
import './DepartmentModal.css';

function DepartmentModal({ isOpen, onClose, departments, onAdd, onUpdate, onDelete, users }) {
  const [newDepartmentName, setNewDepartmentName] = useState('');
  
  // Estado para controlar qual departamento está a ser editado
  const [editingDeptId, setEditingDeptId] = useState(null);
  
  // Estado para guardar os dados do formulário de edição
  const [editFormData, setEditFormData] = useState({ name: '', managerId: '' });

  useEffect(() => {
    // Se o modal for fechado, limpa o estado de edição
    if (!isOpen) {
      setEditingDeptId(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAddClick = () => {
    if (newDepartmentName.trim()) {
      onAdd({ nome: newDepartmentName.trim() });
      setNewDepartmentName('');
    }
  };

  const handleStartEdit = (dept) => {
    setEditingDeptId(dept._id);
    setEditFormData({
      name: dept.nome,
      managerId: dept.gestor?._id || ''
    });
  };

  const handleCancelEdit = () => {
    setEditingDeptId(null);
  };

  const handleUpdateClick = () => {
    if (editingDeptId && editFormData.name.trim()) {
      onUpdate(editingDeptId, {
        nome: editFormData.name,
        gestor: editFormData.managerId || null
      });
      setEditingDeptId(null);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="department-modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Gerir Departamentos</h2>
        <div className="add-department-form">
          <input
            type="text"
            value={newDepartmentName}
            onChange={(e) => setNewDepartmentName(e.target.value)}
            placeholder="Nome do novo departamento"
          />
          <button onClick={handleAddClick}>Adicionar</button>
        </div>
        
        <ul className="department-list">
          {departments.map((dept) => (
            <li key={dept._id} className="department-item">
              {editingDeptId === dept._id ? (
                // Formulário de Edição
                <>
                  <input 
                    type="text" 
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    className="edit-input"
                  />
                  <select
                    value={editFormData.managerId}
                    onChange={(e) => setEditFormData({ ...editFormData, managerId: e.target.value })}
                    className="edit-select"
                  >
                    <option value="">Sem Gestor</option>
                    {users.map(user => (
                      <option key={user._id} value={user._id}>{user.nome}</option>
                    ))}
                  </select>
                  <div className="department-actions">
                    <button onClick={handleUpdateClick} title="Guardar">💾</button>
                    <button onClick={handleCancelEdit} title="Cancelar">❌</button>
                  </div>
                </>
              ) : (
                // Visualização Normal
                <>
                  <span className="dept-name">{dept.nome}</span>
                  <span className="dept-manager">{dept.gestor ? `Gestor: ${dept.gestor.nome}` : 'Sem gestor'}</span>
                  <div className="department-actions">
                    <button onClick={() => handleStartEdit(dept)} title="Editar">✏️</button>
                    <button onClick={() => onDelete(dept._id)} title="Apagar" className="btn-delete">🗑️</button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>

        <div className="department-modal-actions">
          <button onClick={onClose}>Fechar</button>
        </div>
      </div>
    </div>
  );
}

export default DepartmentModal;