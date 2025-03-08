// File: src/App.js
import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import Memories from './components/Memories';
import './App.css';
import './components/Memories.css';

function App() {
  const [startDate, setStartDate] = useState('');
  const [timePassed, setTimePassed] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [image1, setImage1] = useState(null);
  const [image2, setImage2] = useState(null);
  const [image1URL, setImage1URL] = useState('');
  const [image2URL, setImage2URL] = useState('');
  const [songs, setSongs] = useState([]);
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showMemories, setShowMemories] = useState(false);
  const audioRef = useRef(null);
  const [savedDate, setSavedDate] = useState('');

  // Cấu hình Firebase - chỉ cần cho Firestore
  const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
  };

  // Khởi tạo Firebase
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  // Load dữ liệu từ localStorage khi khởi động
  useEffect(() => {
    const savedDateFromStorage = localStorage.getItem('loveStartDate');
    if (savedDateFromStorage) {
      setSavedDate(savedDateFromStorage);
      setStartDate(savedDateFromStorage);
    }

    const savedImage1 = localStorage.getItem('image1URL');
    const savedImage2 = localStorage.getItem('image2URL');
    
    if (savedImage1) setImage1URL(savedImage1);
    if (savedImage2) setImage2URL(savedImage2);

    // Load danh sách bài hát từ localStorage
    loadSongs();
  }, []);

  // Cập nhật thời gian real-time
  useEffect(() => {
    if (!startDate) return;

    const intervalId = setInterval(() => {
      const start = new Date(startDate);
      const now = new Date();
      const diff = now - start;

      // Chuyển đổi mili giây thành ngày, giờ, phút, giây
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimePassed({ days, hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [startDate]);

  // Xử lý khi người dùng nhập ngày bắt đầu yêu
  const handleStartDateChange = (e) => {
    setStartDate(e.target.value);
    localStorage.setItem('loveStartDate', e.target.value);
    setSavedDate(e.target.value);
  };

  // Xử lý khi người dùng tải lên hình ảnh
  const handleImageUpload = (e, imageNum) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const imageDataURL = event.target.result;
      
      if (imageNum === 1) {
        setImage1(file);
        setImage1URL(imageDataURL);
        localStorage.setItem('image1URL', imageDataURL);
      } else {
        setImage2(file);
        setImage2URL(imageDataURL);
        localStorage.setItem('image2URL', imageDataURL);
      }
    };
    reader.readAsDataURL(file);
  };

  // Xử lý khi người dùng tải lên bài hát - sử dụng localStorage
  const handleSongUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Kiểm tra kích thước file (giới hạn ở 3MB để tránh vượt quá giới hạn localStorage)
    if (file.size > 3 * 1024 * 1024) {
      alert('File quá lớn! Vui lòng chọn file nhỏ hơn 3MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      // Lưu dữ liệu bài hát vào localStorage
      const songData = {
        name: file.name,
        url: event.target.result, // Lưu dưới dạng Data URL
        addedAt: new Date().toISOString()
      };
      
      // Lấy danh sách bài hát hiện tại
      const currentSongs = JSON.parse(localStorage.getItem('songs') || '[]');
      
      // Thêm bài hát mới vào danh sách
      currentSongs.push(songData);
      
      // Lưu lại danh sách mới
      localStorage.setItem('songs', JSON.stringify(currentSongs));
      
      // Cập nhật state
      setSongs(currentSongs);
      
      // Tự động chọn bài hát đầu tiên nếu chưa có bài hát nào
      if (!currentSong) {
        setCurrentSong(songData);
      }
      
      alert('Tải lên bài hát thành công!');
    };
    
    reader.readAsDataURL(file); // Đọc file dưới dạng Data URL
  };

  // Tải danh sách bài hát từ localStorage
  const loadSongs = () => {
    const songsData = JSON.parse(localStorage.getItem('songs') || '[]');
    setSongs(songsData);
    
    // Tự động chọn bài hát đầu tiên nếu có
    if (songsData.length > 0 && !currentSong) {
      setCurrentSong(songsData[0]);
    }
  };

  // Phát bài hát được chọn
  const playSong = (song) => {
    setCurrentSong(song);
    setIsPlaying(true);
    
    // Đảm bảo audio được tải và phát
    if (audioRef.current) {
      audioRef.current.src = song.url;
      audioRef.current.play();
    }
  };

  // Tạm dừng/tiếp tục phát nhạc
  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Chuyển bài hát
  const nextSong = () => {
    if (songs.length > 0) {
      const currentIndex = songs.findIndex(song => song.name === currentSong.name);
      const nextIndex = (currentIndex + 1) % songs.length;
      playSong(songs[nextIndex]);
    }
  };

  // Xóa bài hát
  const deleteSong = (index) => {
    if (window.confirm('Bạn có chắc muốn xóa bài hát này?')) {
      const updatedSongs = [...songs];
      updatedSongs.splice(index, 1);
      
      // Cập nhật localStorage
      localStorage.setItem('songs', JSON.stringify(updatedSongs));
      
      // Cập nhật state
      setSongs(updatedSongs);
      
      // Nếu đang phát bài hát bị xóa
      if (currentSong && currentSong.name === songs[index].name) {
        if (updatedSongs.length > 0) {
          setCurrentSong(updatedSongs[0]);
          if (isPlaying && audioRef.current) {
            audioRef.current.src = updatedSongs[0].url;
            audioRef.current.play();
          }
        } else {
          setCurrentSong(null);
          setIsPlaying(false);
        }
      }
    }
  };

  // Toggle hiển thị phần kỷ niệm
  const toggleMemories = () => {
    setShowMemories(!showMemories);
  };

  return (
    <div className="app-container">
      <div className="hearts-background"></div>
      
      <div className="content">
        <h1>Thời Gian Yêu Nhau</h1>
        
        {!savedDate && (
          <div className="date-input">
            <label>Ngày bắt đầu yêu nhau:</label>
            <input 
              type="date" 
              value={startDate} 
              onChange={handleStartDateChange}
            />
          </div>
        )}
        
        {savedDate && (
          <div className="love-counter">
            <div className="date-display">
              Bắt đầu yêu nhau từ: {new Date(savedDate).toLocaleDateString('vi-VN')}
            </div>
            
            <div className="time-boxes">
              <div className="time-box">
                <div className="time-value">{timePassed.days}</div>
                <div className="time-label">Ngày</div>
              </div>
              <div className="time-box">
                <div className="time-value">{timePassed.hours}</div>
                <div className="time-label">Giờ</div>
              </div>
              <div className="time-box">
                <div className="time-value">{timePassed.minutes}</div>
                <div className="time-label">Phút</div>
              </div>
              <div className="time-box">
                <div className="time-value">{timePassed.seconds}</div>
                <div className="time-label">Giây</div>
              </div>
            </div>
          </div>
        )}
        
        <div className="photos-container">
          <div className="photo-upload">
            <div className="photo-frame">
              {image1URL ? (
                <img src={image1URL} alt="Người yêu 1" />
              ) : (
                <div className="upload-placeholder">
                  <span>Ảnh người yêu 1</span>
                </div>
              )}
            </div>
            <input 
              type="file" 
              accept="image/*" 
              onChange={(e) => handleImageUpload(e, 1)} 
              id="image1-upload"
            />
            <label htmlFor="image1-upload" className="upload-btn">Chọn ảnh</label>
          </div>
          
          <div className="heart-icon">❤️</div>
          
          <div className="photo-upload">
            <div className="photo-frame">
              {image2URL ? (
                <img src={image2URL} alt="Người yêu 2" />
              ) : (
                <div className="upload-placeholder">
                  <span>Ảnh người yêu 2</span>
                </div>
              )}
            </div>
            <input 
              type="file" 
              accept="image/*" 
              onChange={(e) => handleImageUpload(e, 2)} 
              id="image2-upload"
            />
            <label htmlFor="image2-upload" className="upload-btn">Chọn ảnh</label>
          </div>
        </div>
        
        <div className="music-player">
          <h2>Nhạc Tình Yêu</h2>
          
          <div className="upload-song">
            <input 
              type="file" 
              accept="audio/*" 
              onChange={handleSongUpload} 
              id="song-upload"
            />
            <label htmlFor="song-upload" className="upload-btn">Tải lên bài hát</label>
          </div>
          
          <div className="songs-list">
            <h3>Danh sách bài hát:</h3>
            <ul>
              {songs.map((song, index) => (
                <li 
                  key={index} 
                  className={currentSong && currentSong.name === song.name ? 'active' : ''}
                >
                  <div className="song-name" onClick={() => playSong(song)}>
                    {song.name}
                  </div>
                  <button className="delete-song-btn" onClick={() => deleteSong(index)}>
                    <i className="fas fa-trash"></i>
                  </button>
                </li>
              ))}
            </ul>
          </div>
          
          {currentSong && (
            <div className="player-controls">
              <div className="now-playing">
                Đang phát: {currentSong.name}
              </div>
              
              <div className="controls">
                <button onClick={togglePlay}>
                  {isPlaying ? '⏸️ Tạm dừng' : '▶️ Phát'}
                </button>
                <button onClick={nextSong}>⏭️ Bài tiếp theo</button>
              </div>
              
              <audio 
                ref={audioRef}
                src={currentSong.url}
                onEnded={nextSong}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
            </div>
          )}
        </div>
        
        <div className="memories-section">
          <button className="toggle-memories" onClick={toggleMemories}>
            {showMemories ? 'Ẩn kỷ niệm' : 'Hiện kỷ niệm'}
          </button>
          
          {showMemories && <Memories db={db} />}
        </div>
        
        <div className="footer">
          <p>Made with ❤️ | Copyright © {new Date().getFullYear()}</p>
        </div>
      </div>
    </div>
  );
}

export default App;