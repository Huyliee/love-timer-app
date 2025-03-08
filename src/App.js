// File: src/App.js
import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import Memories from './components/Memories';
import './App.css';
import './components/Memories.css';
import anh from './assets/images/anh.jpg'
import em from './assets/images/em.jpg'

function App() {
  // Dữ liệu tĩnh - cố định ngày bắt đầu yêu
  const FIXED_START_DATE = '2023-06-13'; // Định dạng YYYY-MM-DD
  
  // Dữ liệu tĩnh - URL hình ảnh cố định (thay bằng URL thực của bạn)
  const FIXED_IMAGE1_URL = anh; 
  const FIXED_IMAGE2_URL = em;
  
  const [timePassed, setTimePassed] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [songs, setSongs] = useState([]);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showMemories, setShowMemories] = useState(false);
  const [audioInitialized, setAudioInitialized] = useState(false);
  const audioRef = useRef(null);

  // Cấu hình Firebase - chỉ cần cho Firestore
  const firebaseConfig = {
    apiKey: "AIzaSyCUSalSutYeaHIBfGaGD2ZsH6uKqH0V-pI",
    authDomain: "love-timer-app.firebaseapp.com",
    projectId: "love-timer-app",
    storageBucket: "love-timer-app.firebasestorage.app",
    messagingSenderId: "1087483957266",
    appId: "1:1087483957266:web:9636b9b9852a8e19e788cb",
    measurementId: "G-R8XP9GDRPL"
  };

  // Khởi tạo Firebase
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  // Hàm để lấy đường dẫn gốc chính xác của ứng dụng
  const getBaseUrl = () => {
    // Sử dụng URL cố định dựa trên môi trường
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return `${window.location.origin}/Huyliee/love-timer-app/`;
    } else {
      return 'https://Huyliee.github.io/love-timer-app/';
    }
  };

  // Danh sách bài hát với URL động
  const localSongs = [
    { name: "Dù cho tận thế", filename: "song1.mp3" },
  ];

  // Lấy URL chính xác cho file nhạc
  const getSongUrl = (filename) => {
    return `${getBaseUrl()}music/${filename}`;
  };

  // Khởi tạo danh sách bài hát với URL
  const initializeSongs = () => {
    return localSongs.map(song => ({
      name: song.name,
      url: getSongUrl(song.filename)
    }));
  };

  // Load dữ liệu khi khởi động
  useEffect(() => {
    const songsList = initializeSongs();
    console.log("URL bài hát:", songsList[0].url);
    setSongs(songsList);
  }, []);

  // Phát nhạc sau khi người dùng tương tác
  const initializeAudio = () => {
    setAudioInitialized(true);
    if (audioRef.current && songs.length > 0) {
      audioRef.current.play().catch(error => {
        console.log("Không thể phát nhạc:", error);
      });
      setIsPlaying(true);
    }
  };

  // Cập nhật thời gian real-time
  useEffect(() => {
    const intervalId = setInterval(() => {
      const start = new Date(FIXED_START_DATE);
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
  }, []);

  // Toggle phát/tạm dừng nhạc
  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(error => {
          console.log("Không thể phát nhạc:", error);
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Chuyển bài tiếp theo
  const nextSong = () => {
    if (songs.length > 0) {
      const nextIndex = (currentSongIndex + 1) % songs.length;
      setCurrentSongIndex(nextIndex);
      
      // Tự động phát bài mới nếu đang phát
      setTimeout(() => {
        if (audioRef.current && isPlaying) {
          audioRef.current.play().catch(error => {
            console.log("Không thể phát nhạc:", error);
          });
        }
      }, 100);
    }
  };

  // Xử lý khi bài hát kết thúc
  const handleSongEnd = () => {
    nextSong();
  };

  // Toggle hiển thị phần kỷ niệm
  const toggleMemories = () => {
    setShowMemories(!showMemories);
  };

  // Lấy bài hát hiện tại
  const currentSong = songs[currentSongIndex];

  return (
    <div className="app-container">
      <div className="hearts-background"></div>
      
      {!audioInitialized && (
        <div className="audio-init-overlay">
          <button 
            className="audio-init-button"
            onClick={initializeAudio}
          >
            <i className="fas fa-play-circle"></i>
            <span>Nhấp để nghe nhạc</span>
          </button>
        </div>
      )}
      
      <div className="content">
        <h1>Thời Gian Yêu Nhau</h1>
        
        <div className="love-counter">
          <div className="date-display">
            Bắt đầu yêu nhau từ: {new Date(FIXED_START_DATE).toLocaleDateString('vi-VN')}
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
        
        <div className="photos-container">
          <div className="photo-item">
            <div className="photo-frame">
              <img src={FIXED_IMAGE1_URL} alt="Người yêu 1" />
            </div>
            <div className="photo-caption">Ngọc Huy</div>
          </div>
          
          <div className="heart-icon">❤️</div>
          
          <div className="photo-item">
            <div className="photo-frame">
              <img src={FIXED_IMAGE2_URL} alt="Người yêu 2" />
            </div>
            <div className="photo-caption">Bảo Ngân</div>
          </div>
        </div>
        
        <div className="music-player">
          <h2>Nhạc Tình Yêu</h2>
          
          {currentSong && (
            <div className="player-controls">
              <div className="now-playing">
                <i className="fas fa-headphones"></i> Đang phát: {currentSong.name}
              </div>
              
              <div className="controls">
                <button className="play-btn" onClick={togglePlay}>
                  <i className={isPlaying ? "fas fa-pause" : "fas fa-play"}></i> 
                  {isPlaying ? "Tạm dừng" : "Phát nhạc"}
                </button>
                <button className="next-btn" onClick={nextSong}>
                  <i className="fas fa-step-forward"></i> Bài tiếp theo
                </button>
              </div>
              
              <audio 
                ref={audioRef}
                controls
                className="audio-controls"
                src={currentSong.url}
                onEnded={handleSongEnd}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              ></audio>
            </div>
          )}
        </div>
        
        <div className="footer">
          <p>Made with ❤️ | Copyright © {new Date().getFullYear()}</p>
        </div>
      </div>
    </div>
  );
}

export default App;