// src/components/Memories.js
import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';

const Memories = ({ db }) => {
  const [memories, setMemories] = useState([]);
  const [newMemory, setNewMemory] = useState({
    title: '',
    date: '',
    description: '',
    image: null,
    imageUrl: ''
  });
  const [isAdding, setIsAdding] = useState(false);

  // Lấy danh sách kỷ niệm từ Firestore
  useEffect(() => {
    const fetchMemories = async () => {
      try {
        const memoriesCollection = collection(db, 'memories');
        const snapshot = await getDocs(memoriesCollection);
        const memoriesList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Sắp xếp theo ngày giảm dần (mới nhất lên đầu)
        memoriesList.sort((a, b) => new Date(b.date) - new Date(a.date));
        setMemories(memoriesList);
      } catch (error) {
        console.error("Lỗi khi lấy kỷ niệm:", error);
      }
    };

    fetchMemories();
  }, [db]);

  // Xử lý thay đổi trường input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewMemory(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Xử lý khi chọn hình ảnh
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setNewMemory(prev => ({
        ...prev,
        image: file,
        imageUrl: event.target.result
      }));
    };
    reader.readAsDataURL(file);
  };

  // Thêm kỷ niệm mới
  const handleAddMemory = async (e) => {
    e.preventDefault();
    
    try {
      // Chuẩn bị dữ liệu kỷ niệm
      const memoryData = {
        title: newMemory.title,
        date: newMemory.date,
        description: newMemory.description,
        imageUrl: newMemory.imageUrl,
        createdAt: new Date().toISOString()
      };
      
      // Lưu vào Firestore
      const docRef = await addDoc(collection(db, 'memories'), memoryData);
      
      // Thêm ID từ Firestore
      const newMemoryWithId = {
        id: docRef.id,
        ...memoryData
      };
      
      // Cập nhật state
      setMemories(prev => [newMemoryWithId, ...prev]);
      
      // Reset form
      setNewMemory({
        title: '',
        date: '',
        description: '',
        image: null,
        imageUrl: ''
      });
      
      setIsAdding(false);
    } catch (error) {
      console.error("Lỗi khi thêm kỷ niệm:", error);
      alert("Có lỗi xảy ra khi thêm kỷ niệm. Vui lòng thử lại!");
    }
  };

  // Xóa kỷ niệm
  const handleDeleteMemory = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa kỷ niệm này?")) {
      try {
        await deleteDoc(doc(db, 'memories', id));
        setMemories(prev => prev.filter(memory => memory.id !== id));
      } catch (error) {
        console.error("Lỗi khi xóa kỷ niệm:", error);
        alert("Có lỗi xảy ra khi xóa kỷ niệm. Vui lòng thử lại!");
      }
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  };

  return (
    <div className="memories-container">
      <h2>Kỷ niệm đáng nhớ</h2>
      
      {!isAdding ? (
        <button 
          className="add-button"
          onClick={() => setIsAdding(true)}
        >
          <i className="fas fa-plus"></i> Thêm kỷ niệm mới
        </button>
      ) : (
        <div className="memory-form">
          <h3>Thêm kỷ niệm mới</h3>
          <form onSubmit={handleAddMemory}>
            <div className="form-group">
              <label>Tiêu đề:</label>
              <input 
                type="text" 
                name="title" 
                value={newMemory.title} 
                onChange={handleInputChange} 
                required 
              />
            </div>
            
            <div className="form-group">
              <label>Ngày:</label>
              <input 
                type="date" 
                name="date" 
                value={newMemory.date} 
                onChange={handleInputChange} 
                required 
              />
            </div>
            
            <div className="form-group">
              <label>Mô tả:</label>
              <textarea 
                name="description" 
                value={newMemory.description} 
                onChange={handleInputChange} 
                required 
              />
            </div>
            
            <div className="form-group">
              <label>Hình ảnh:</label>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageChange} 
                id="memory-image" 
                className="file-input" 
              />
              <label htmlFor="memory-image" className="file-label">
                <i className="fas fa-cloud-upload-alt"></i> Chọn ảnh
              </label>
              
              {newMemory.imageUrl && (
                <div className="image-preview">
                  <img src={newMemory.imageUrl} alt="Xem trước" />
                </div>
              )}
            </div>
            
            <div className="form-buttons">
              <button type="submit" className="submit-button">
                <i className="fas fa-save"></i> Lưu kỷ niệm
              </button>
              <button 
                type="button" 
                className="cancel-button"
                onClick={() => setIsAdding(false)}
              >
                <i className="fas fa-times"></i> Hủy
              </button>
            </div>
          </form>
        </div>
      )}
      
      <div className="memories-list">
        {memories.length === 0 ? (
          <p className="no-memories">Chưa có kỷ niệm nào. Hãy thêm kỷ niệm đầu tiên của bạn!</p>
        ) : (
          memories.map((memory, index) => (
            <div className="memory-card" key={memory.id || index}>
              {memory.imageUrl && (
                <div className="memory-image">
                  <img src={memory.imageUrl} alt={memory.title} />
                </div>
              )}
              
              <div className="memory-content">
                <h4>{memory.title}</h4>
                <div className="memory-date">{formatDate(memory.date)}</div>
                <p>{memory.description}</p>
                
                <button 
                  className="delete-button"
                  onClick={() => handleDeleteMemory(memory.id)}
                >
                  <i className="fas fa-trash"></i>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Memories;