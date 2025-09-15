// src/DepartmentModal.js - COMPLETAMENTE ATUALIZADO
import React, { useState } from 'react';
import './DepartmentModal.css';

// O modal agora precisa da lista de utilizadores para o dropdown
function DepartmentModal({ isOpen, onClose, departments, onAdd, onUpdate, onDelete, users }) {
  const [newDepartmentName, setNewDepartmentName] = useState('');
  const [editingDepartment, setEditingDepartment] = useState(null);

  if (!isOpen) return null;

  const handleAddClick = () => {
    if (newDepartmentName) {
      onAdd({ nome: newDepartmentName });
      setNewDepartmentName('');
    }
  };

  const handleUpdateClick = () => {
    if (editingDepartment) {
      onUpdate(editingDepartment._id, { 
        nome: editingDepartment.nome, 
        gestor: editingDepartment.gestor?._id || editingDepartment.gestor 
      });
      setEditingDepartment(null);
    }
  };

  const startEditing = (dept) => {
    setEditingDepartment({ ...dept });
  };
  
  const cancelEditing = () => {
    setEditingDepartment(null);
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
              {editingDepartment?._id === dept._id ? (
                <>
                  <input 
                    type="text" 
                    value={editingDepartment.nome}
                    onChange={(e) => setEditingDepartment({...editingDepartment, nome: e.target.value})}
                    className="edit-input"
                  />
                  <select
                    value={editingDepartment.gestor?._id || editingDepartment.gestor || ''}
                    onChange={(e) => setEditingDepartment({...editingDepartment, gestor: e.target.value})}
                    className="edit-select"
                  >
                    <option value="">Sem Gestor</option>
                    {users.map(user => (
                      <option key={user._id} value={user._id}>{user.nome}</option>
                    ))}
                  </select>
                  <div className="department-actions">
                    <button onClick={handleUpdateClick} title="Guardar">💾</button>
                    <button onClick={cancelEditing} title="Cancelar">❌</button>
                  </div>
                </>
              ) : (
                <>
                  <span className="dept-name">{dept.nome}</span>
                  <span className="dept-manager">{dept.gestor ? `Gestor: ${dept.gestor.nome}` : 'Sem gestor'}</span>
                  <div className="department-actions">
                    <button onClick={() => startEditing(dept)} title="Editar">✏️</button>
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