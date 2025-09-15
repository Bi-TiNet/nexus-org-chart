// src/DepartmentModal.js
import React, { useState } from 'react';

function DepartmentModal({ isOpen, onClose, departments, onAdd, onUpdate, onDelete }) {
  const [newDepartmentName, setNewDepartmentName] = useState('');

  if (!isOpen) return null;

  const handleAddClick = () => {
    if (newDepartmentName.trim()) {
      onAdd(newDepartmentName.trim());
      setNewDepartmentName('');
    }
  };

  const handleUpdateClick = (id, currentName) => {
    const newName = prompt("Digite o novo nome para o departamento:", currentName);
    if (newName && newName.trim() !== currentName) {
      onUpdate(id, newName.trim());
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Gerenciar Departamentos</h2>

        <div className="department-add-form">
          <input
            type="text"
            value={newDepartmentName}
            onChange={(e) => setNewDepartmentName(e.target.value)}
            placeholder="Nome do novo departamento"
          />
          <button onClick={handleAddClick}>Adicionar</button>
        </div>

        <ul className="department-list">
          {departments.length > 0 ? (
            departments.map(dept => (
              <li key={dept._id}>
                <span>{dept.nome}</span>
                <div className="department-actions">
                  <button onClick={() => handleUpdateClick(dept._id, dept.nome)}>✏️</button>
                  <button onClick={() => onDelete(dept._id)}>🗑️</button>
                </div>
              </li>
            ))
          ) : (
            <p>Nenhum departamento cadastrado.</p>
          )}
        </ul>

        <div className="modal-actions">
          <button onClick={onClose} className="btn-save">Fechar</button>
        </div>
      </div>
    </div>
  );
}

export default DepartmentModal;