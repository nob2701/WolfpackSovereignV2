import { initializeApp, getApps } from 'firebase/app';
import { 
  getDatabase, ref, set, get, onValue, update, push, remove, onDisconnect
} from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyANIopuQprhN_dHI2W7WYwwPU2U4_Q8cWQ",
  authDomain: "wolfsovereignonline.firebaseapp.com",
  databaseURL: "https://wolfsovereignonline-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "wolfsovereignonline",
  storageBucket: "wolfsovereignonline.firebasestorage.app",
  messagingSenderId: "325072915230",
  appId: "1:325072915230:web:890a43e396cd847046170f"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getDatabase(app);

let serverTimeOffset = 0;
const offsetRef = ref(db, ".info/serverTimeOffset");
onValue(offsetRef, (snap) => {
  serverTimeOffset = snap.val() || 0;
});

export const getSynchronizedTimestamp = (): number => {
  return Date.now() + serverTimeOffset;
};

export const verifyRoomPassword = async (roomId: string, inputPassword = ""): Promise<{ valid: boolean; reason?: string }> => {
  try {
    const metaSnapshot = await get(ref(db, `rooms/${roomId}/meta`));
    if (!metaSnapshot.exists()) {
      return { valid: false, reason: "Phòng chơi không tồn tại!" };
    }
    
    const meta = metaSnapshot.val();
    const roomPassword = meta.password || "";

    if (!roomPassword || String(roomPassword).trim() === "") {
      return { valid: true };
    }

    if (String(roomPassword).trim() === String(inputPassword).trim()) {
      return { valid: true };
    } else {
      return { valid: false, reason: "Mật khẩu phòng chơi không chính xác!" };
    }
  } catch (err) {
    console.error("Verify Password Error:", err);
    return { valid: false, reason: "Lỗi kết nối máy chủ khi kiểm tra mật khẩu phòng!" };
  }
};

export const resetGameRoomNodes = async (roomId: string) => {
  if (!roomId) return;
  const updates: Record<string, any> = {};
  updates[`rooms/${roomId}/wolf_votes`] = null;
  updates[`rooms/${roomId}/prediction_poll`] = null;
  updates[`rooms/${roomId}/nominations`] = null;
  updates[`rooms/${roomId}/votes`] = null;
  updates[`rooms/${roomId}/mayor_votes`] = null;
  updates[`rooms/${roomId}/gm_whispers`] = null;
  updates[`rooms/${roomId}/trial`] = {
    stage: "none",
    accusedId: null,
    accusedText: "",
    decisionText: ""
  };
  try {
    await update(ref(db), updates);
  } catch (err) {
    console.error("Firebase Reset Error:", err);
  }
};

export {
  ref, set, get, onValue, update, push, remove, onDisconnect
};
