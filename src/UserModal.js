// src/UserModal.js

import React from 'react';

// Adicionamos 'users' às props que o componente recebe
function UserModal({ isOpen, onClose, onSave, formData, setFormData, departments, users }) {
  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{formData.id ? "Editar Funcionário" : "Adicionar Novo Funcionário"}</h2>
        <form onSubmit={(e) => { e.preventDefault(); onSave(); }}>
          {/* Campos Nome e Cargo */}
          <div className="form-group">
            <label>Nome:</label>
            <input type="text" name="nome" value={formData.nome} onChange={handleInputChange} required />
          </div>
          <div className="form-group">
            <label>Cargo:</label>
            <input type="text" name="cargo" value={formData.cargo} onChange={handleInputChange} required />
          </div>

          {/* Campo de Seleção de Departamento */}
          <div className="form-group">
            <label>Departamento:</label>
            <select name="departamento" value={formData.departamento || ''} onChange={handleInputChange}>
              <option value="">-- Sem Departamento --</option>
              {departments.map(dept => (
                <option key={dept._id} value={dept._id}>{dept.nome}</option>
              ))}
            </select>
          </div>

          {/* NOSSO NOVO CAMPO DE SELEÇÃO DE GESTOR */}
          <div className="form-group">
            <label>Se reporta a:</label>
            <select name="gestor" value={formData.gestor || ''} onChange={handleInputChange}>
              <option value="">-- Ninguém (CEO, etc.) --</option>
              {/* Filtramos a lista para que o usuário atual não apareça como opção de gestor */}
              {users.filter(user => user.id !== formData.id).map(user => (
                <option key={user._id} value={user._id}>
                  {user.data.name}
                </option>
              ))}
            </select>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-cancel">Cancelar</button>
            <button type="submit" className="btn-save">Salvar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UserModal;