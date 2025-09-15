// src/UserModal.js - FASE 1: PERFIS 360º
import React from 'react';
import './UserModal.css';

function UserModal({ isOpen, onClose, onSave, formData, setFormData, departments, users }) {
  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Lógica para lidar com campos de texto que serão convertidos em arrays (skills, projetos)
  const handleArrayChange = (e) => {
    const { name, value } = e.target;
    // Converte a string separada por vírgulas num array de strings, removendo espaços extra
    setFormData(prev => ({ ...prev, [name]: value.split(',').map(item => item.trim()) }));
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{formData._id ? 'Editar Funcionário' : 'Adicionar Funcionário'}</h2>
        
        <label>Nome:</label>
        <input type="text" name="nome" value={formData.nome || ''} onChange={handleChange} placeholder="Nome completo"/>

        <label>Cargo:</label>
        <input type="text" name="cargo" value={formData.cargo || ''} onChange={handleChange} placeholder="Cargo do funcionário"/>
        
        <label>Email:</label>
        <input type="email" name="email" value={formData.email || ''} onChange={handleChange} placeholder="email@empresa.com"/>

        <label>Departamento:</label>
        <select name="departamento" value={formData.departamento || ''} onChange={handleChange}>
          <option value="">Nenhum</option>
          {departments.map(d => <option key={d._id} value={d._id}>{d.nome}</option>)}
        </select>

        <label>Gestor:</label>
        <select name="gestor" value={formData.gestor || ''} onChange={handleChange}>
          <option value="">Nenhum</option>
          {users.filter(u => u._id !== formData._id).map(u => <option key={u._id} value={u._id}>{u.nome}</option>)}
        </select>

        <label>Status:</label>
        <select name="status" value={formData.status || 'Disponível'} onChange={handleChange}>
            <option value="Disponível">Disponível</option>
            <option value="Ocupado">Ocupado</option>
            <option value="De Férias">De Férias</option>
        </select>

        <label>Competências (separadas por vírgula):</label>
        <input 
          type="text" 
          name="skills" 
          value={(formData.skills || []).join(', ')} 
          onChange={handleArrayChange} 
          placeholder="React, Node.js, Redes..."
        />

        <label>Projetos Atuais (separados por vírgula):</label>
        <input 
          type="text" 
          name="projetos" 
          value={(formData.projetos || []).join(', ')} 
          onChange={handleArrayChange} 
          placeholder="Nexus, Projeto X..."
        />

        <div className="modal-actions">
          <button onClick={onClose} className="btn-cancel">Cancelar</button>
          <button onClick={onSave} className="btn-save">Guardar</button>
        </div>
      </div>
    </div>
  );
}

export default UserModal;