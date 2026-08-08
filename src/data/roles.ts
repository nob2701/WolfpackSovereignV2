import { Faction, RoleInfo } from '../types';

export const PASSIVE_ROLES: string[] = [
  "villager", "clown", "idiot", "ghost", "halfWolf", "apprenticeSeer", 
  "doppelganger", "lostChild", "headlessKnight", "paradox", "fugitive", 
  "cryptoMiner", "reverser", "glitch", "sovereign", "ember", "traitor", 
  "blackDeath", "loneWolf", "chaosWolf", "bloodline", "ashenKnight"
];

export const ACTIVE_NIGHT_ROLES: string[] = [
  "seer", "guard", "witch", "hunter", "cupid", "avenger", "carver", 
  "guarantor", "reflector", "thief", "police", "spy", "angel", 
  "demonologist", "parrot", "wolf", "wolfBoss", "wolfSnow", "wolfMage", 
  "phantomWolf", "clairvoyantWolf", "mirrorWolf", "resonanceWolf", 
  "silencerWolf", "solitaireWolf", "demonDetective", "missionary", 
  "vampire", "arsonist", "eradicator", "manipulator", "impostor", 
  "bountyHunter", "shark", "apprenticeReaper", "serialKiller", 
  "prime", "cat", "reaper"
];

export const ROLE_ICONS: Record<string, string> = {
  villager: '🌾', seer: '🔮', guard: '🛡️', witch: '🧪', hunter: '🏹', cupid: '💘', halfWolf: '🐺', headlessKnight: '🎃', apprenticeSeer: '👁️', ghost: '👻', thief: '🦹', doppelganger: '🎭', avenger: '⚔️', paradox: '⏳', lostChild: '👶', carver: '🔪', guarantor: '🤝', reflector: '🪞', fugitive: '🏃', cryptoMiner: '⛏️', reverser: '🔄', glitch: '👾', police: '🔫', spy: '🕵️', angel: '👼', sovereign: '👑', demonologist: '🧿', parrot: '🦜', ember: '🔥', idiot: '🤡',
  wolf: '🐺', wolfBoss: '👑', wolfSnow: '❄️', wolfMage: '👁️‍🗨️', traitor: '🕵️', blackDeath: '🦠', phantomWolf: '🎭', clairvoyantWolf: '👁', mirrorWolf: '🪞', resonanceWolf: '🐺', silencerWolf: '🤫', loneWolf: '🐺', solitaireWolf: '🃏', chaosWolf: '🌪️', bloodline: '🩸',
  demonDetective: '🦇', missionary: '🕍', vampire: '🧛', arsonist: '🔥', eradicator: '⚔️', clown: '🤡', manipulator: '🪄', impostor: '🥸', bountyHunter: '🎯', shark: '🦈', apprenticeReaper: '🪦', serialKiller: '🔪', prime: '👑', ashenKnight: '⚔️', cat: '🐈', reaper: '💀'
};

export const FACTION_ICONS: Record<Faction, string> = {
  villager: '🌾',
  wolf: '🐺',
  third: '🧛'
};

export const ROLE_FACTIONS: Record<string, Faction> = {
  // Villagers (30)
  villager: 'villager', seer: 'villager', guard: 'villager', witch: 'villager', hunter: 'villager', cupid: 'villager', halfWolf: 'villager', headlessKnight: 'villager', apprenticeSeer: 'villager', ghost: 'villager', doppelganger: 'villager', avenger: 'villager', paradox: 'villager', lostChild: 'villager', carver: 'villager', guarantor: 'villager', reflector: 'villager', thief: 'villager', fugitive: 'villager', cryptoMiner: 'villager', reverser: 'villager', glitch: 'villager', police: 'villager', spy: 'villager', angel: 'villager', sovereign: 'villager', demonologist: 'villager', parrot: 'villager', ember: 'villager', idiot: 'villager',
  // Werewolves (15)
  wolf: 'wolf', wolfBoss: 'wolf', wolfSnow: 'wolf', wolfMage: 'wolf', traitor: 'wolf', blackDeath: 'wolf', phantomWolf: 'wolf', clairvoyantWolf: 'wolf', mirrorWolf: 'wolf', resonanceWolf: 'wolf', silencerWolf: 'wolf', loneWolf: 'wolf', solitaireWolf: 'wolf', chaosWolf: 'wolf', bloodline: 'wolf',
  // Third Party (16)
  demonDetective: 'third', missionary: 'third', vampire: 'third', arsonist: 'third', eradicator: 'third', clown: 'third', manipulator: 'third', impostor: 'third', bountyHunter: 'third', shark: 'third', apprenticeReaper: 'third', serialKiller: 'third', prime: 'third', ashenKnight: 'third', cat: 'third', reaper: 'third'
};

export const ROLE_NAMES_VI: Record<string, string> = {
  villager: 'Dân Làng', seer: 'Tiên Tri', guard: 'Bảo Vệ', witch: 'Phù Thủy', hunter: 'Thợ Săn', cupid: 'Cupid', halfWolf: 'Bán Sói', headlessKnight: 'Hiệp Sĩ Không Đầu', apprenticeSeer: 'Tiên Tri Tập Sự', ghost: 'Con Ma', doppelganger: 'Song Trùng', avenger: 'Kẻ Báo Thù', paradox: 'Kẻ Nghịch Hành', lostChild: 'Đứa Con Thất Lạc', carver: 'Kẻ Khắc Tên', guarantor: 'Người Bảo Lãnh', reflector: 'Kẻ Phản Chiếu', thief: 'Tên Trộm', fugitive: 'Kẻ Đào Tẩu', cryptoMiner: 'Kẻ Đào Coin', reverser: 'Người Đảo Ngược', glitch: 'Bản Sao Lỗi', police: 'Cảnh Sát Trưởng', spy: 'Gián Điệp', angel: 'Thiên Sứ', sovereign: 'Kẻ Độc Tôn', demonologist: 'Nhà Ngoại Cảm', parrot: 'Vẹt', ember: 'Kẻ Độc Hành', idiot: 'Kẻ Ngốc',
  wolf: 'Ma Sói', wolfBoss: 'Sói Trùm', wolfSnow: 'Sói Tuyết', wolfMage: 'Pháp Sư Sói', traitor: 'Kẻ Phản Bội', blackDeath: 'Cái Chết Đen', phantomWolf: 'Sói Ảo Ảnh', clairvoyantWolf: 'Sói Thấu Thị', mirrorWolf: 'Sói Gương', resonanceWolf: 'Sói Cộng Hưởng', silencerWolf: 'Sói Câm Lặng', loneWolf: 'Sói Cô Độc', solitaireWolf: 'Sói Tarot', chaosWolf: 'Sói Hỗn Mang', bloodline: 'Sói Già',
  demonDetective: 'Thám Tử Ác Ma', missionary: 'Nhà Truyền Giáo', vampire: 'Ma Cà Rồng', arsonist: 'Kẻ Phóng Hỏa', eradicator: 'Kẻ Thanh Trừng', clown: 'Gã Hề', manipulator: 'Kẻ Thao Túng', impostor: 'Kẻ Mạo Danh', bountyHunter: 'Thợ Săn Tiền Thưởng', shark: 'Cá Mập Tài Chính', apprenticeReaper: 'Thần Chết Tập Sự', serialKiller: 'Sát Nhân', prime: 'Chủ Thần', ashenKnight: 'Kỵ Sĩ Tro Tàn', cat: 'Mèo', reaper: 'Tử Thần'
};

export const ROLE_DESCS_VI: Record<string, string> = {
  // Classic Villagers
  villager: "Thần dân bình thường không có kỹ năng ban đêm. Dùng lời nói, quan sát và logic để tìm ra Ma Sói ban ngày.",
  seer: "Mỗi đêm được chọn 1 người chơi để soi kiểm tra xem người đó thuộc Phe Dân Làng hay Phe Ma Sói.",
  guard: "Mỗi đêm chọn 1 người chơi để bảo vệ khỏi bị tấn công tử vong. Không được bảo vệ 1 người 2 đêm liên tiếp.",
  witch: "Sở hữu 1 bình Dược Thủy cứu sống nạn nhân bị cắn và 1 bình Độc Dược hạ sát 1 mục tiêu. Mỗi bình dùng 1 lần duy nhất.",
  hunter: "Khi bị Sói cắn chết hoặc bị treo cổ ban ngày, bạn có quyền bắn 1 phát súng kéo theo 1 người chơi bất kỳ cùng hy sinh.",
  cupid: "Đêm đầu tiên chọn 2 người se duyên Uyên Ương. Nếu 1 trong 2 người chết, người còn lại tự sát chết theo.",
  halfWolf: "Ban đầu là Dân Làng. Nếu bị Ma Sói hoặc Vampire cắn ban đêm, bạn sẽ thức tỉnh chuyển hóa thành Ma Sói / Vampire.",
  thief: "Đêm đầu tiên được chọn hoán đổi vai trò bí mật với 1 người chơi khác.",
  idiot: "Nếu bị Dân Làng bỏ phiếu treo cổ, bạn lật thẻ chứng minh bị Ngốc và thoát chết, nhưng mất vĩnh viễn quyền bỏ phiếu.",
  clown: "Mục tiêu duy nhất là dụ Dân Làng bỏ phiếu treo cổ mình trên đài biện hộ ban ngày để thắng Đơn Lập tức thì!",

  // Special Expansion Villagers
  headlessKnight: "Hiệp Sĩ Không Đầu. Mang giáp trụ cổ xưa giúp miễn nhiễm hoàn toàn với mọi đòn tấn công sát thương tử vong vào đêm đầu tiên.",
  apprenticeSeer: "Tiên Tri Tập Sự. Ban đầu chưa có kỹ năng. Khi Tiên Tri chính thức tử vong, bạn sẽ lập tức thừa kế quả cầu ma thuật và trở thành Tiên Tri mới.",
  ghost: "Con Ma. Bị hy sinh bí mật ngay đêm đầu tiên. Có thể quan sát toàn bộ ván đấu dưới dạng linh hồn và tự do trò chuyện trong kênh chat Linh Hồn.",
  doppelganger: "Song Trùng. Đêm đầu tiên chọn 1 người chơi làm mục tiêu. Khi mục tiêu đó tử vong, bạn lập tức kế thừa hoàn toàn vai trò và kỹ năng của họ.",
  avenger: "Kẻ Báo Thù. Mỗi đêm chọn 1 mục tiêu: có thể chọn Gây Mê phong ấn kỹ năng đêm của kẻ đó, hoặc giải phóng đòn Trừng Phạt sát thương tử vong.",
  paradox: "Kẻ Nghịch Hành. Nếu bị Dân Làng bỏ phiếu treo cổ ban ngày, năng lượng thời gian tự động kích hoạt đảo ngược kết quả, cứu sống bạn và hủy lượt treo cổ.",
  lostChild: "Đứa Con Thất Lạc. Đêm đầu tiên chọn 1 người làm Nhận Thức. Nếu kẻ đó thuộc phe Sói/Vampire, bạn sẽ thức tỉnh gia nhập phe của họ.",
  carver: "Kẻ Khắc Tên. Đêm chọn khắc tên 1 mục tiêu. Nếu mục tiêu đó bị treo cổ ban ngày, bạn nhận được khiên bảo hộ vĩnh cửu chống lại đòn cắn.",
  guarantor: "Người Bảo Lãnh. Có quyền đứng ra sử dụng quyền lực bảo lãnh cứu 1 người chơi khỏi đài biện hộ treo cổ ban ngày (dùng 1 lần/ván).",
  reflector: "Kẻ Phản Chiếu. Đêm chọn dựng Gương Ma Thuật lên 1 mục tiêu. Mọi kỹ năng tác động vào mục tiêu đó đêm nay sẽ bị dội ngược 100% về kẻ thi triển.",
  fugitive: "Kẻ Đào Tẩu. Kích hoạt kỹ năng ẩn nấp giúp bản thân miễn nhiễm hoàn toàn với việc bị bỏ phiếu treo cổ trong 1 lượt ban ngày.",
  cryptoMiner: "Kẻ Đào Coin. Tích lũy tài nguyên năng lượng qua từng đêm. Khi tích đủ 2 năng lượng, tự động mở khóa 1 lá chắn bảo vệ tính mạng.",
  reverser: "Người Đảo Ngược. Đêm chọn 1 mục tiêu để đảo ngược tác động kỹ năng của họ (Cứu thành Giết, Soi Đúng thành Soi Ngược).",
  glitch: "Bản Sao Lỗi. Phát sóng nhiễu ma thuật ban đêm khiến Tiên Tri hoặc Pháp Sư Sói nhận diện sai lệch kết quả soi kiểm tra.",
  police: "Cảnh Sát Trưởng. Mỗi đêm điều tra 1 mục tiêu để kiểm tra xem kẻ đó có nắm giữ vũ khí nguy hiểm hay kỹ năng hạ sát hay không.",
  spy: "Gián Điệp. Đêm chọn theo dõi bầy Sói. Bạn sẽ đọc được tin nhắn trong kênh chat Sói ban đêm mà không làm lộ danh tính.",
  angel: "Thiên Sứ. Đêm chọn 1 người để ban phước Tịnh Hóa, gột rửa hoàn toàn các bùa câm lặng, phong ấn hay dầu dội khỏi nạn nhân.",
  sovereign: "Kẻ Độc Tôn. Mở khóa lá phiếu Trưởng Làng đặc biệt có trọng số biểu quyết gấp 3 lần bình thường.",
  demonologist: "Nhà Ngoại Cảm. Mỗi đêm cảm nhận tần số tâm linh và nhận thông báo về tổng số lượng Ma Sói còn sống trong vương quốc.",
  parrot: "Vẹt Ma Thuật. Đêm chọn 1 mục tiêu và giao câu lệnh. Sáng hôm sau mục tiêu bắt buộc phải gõ đúng câu lệnh đó trong chat công khai.",
  ember: "Kẻ Độc Hành. Nhận lá chắn miễn nhiễm đòn tấn công đêm nếu bạn là người duy nhất không sử dụng kỹ năng chủ động.",

  // Classic & Special Werewolves
  wolf: "Ma Sói. Cùng bầy Sói thảo luận vào kênh chat riêng và thống nhất chốt 1 nạn nhân bị cắn chết mỗi đêm.",
  wolfBoss: "Sói Trùm. Nắm giữ quyền lực tối cao của bầy Sói. Nếu bầy Sói không thống nhất mục tiêu cắn ban đêm, lá phiếu của Sói Trùm sẽ quyết định nạn nhân.",
  wolfSnow: "Sói Tuyết. Mỗi đêm chọn 1 người chơi để Đóng Băng. Máu lạnh băng tuyết khiến mục tiêu không thể kích hoạt kỹ năng đêm.",
  wolfMage: "Pháp Sư Sói. Mỗi đêm dùng ma thuật soi tìm chính xác ai đang nắm giữ vai trò Tiên Tri hoặc Bảo Vệ trong làng.",
  traitor: "Kẻ Phản Bội. Ban ngày hiển thị là Dân Làng với Tiên Tri. Khi toàn bộ Ma Sói chính thức tử vong, bạn sẽ thức tỉnh trở thành Sói Trùm mới.",
  blackDeath: "Cái Chết Đen. Mang mầm bệnh dịch hạch. Khi bạn bị hạ sát hay treo cổ, mầm bệnh phát tán khiến kẻ tấn công/biểu quyết bạn dính độc tử vong.",
  phantomWolf: "Sói Ảo Ảnh. Đêm chọn 2 người chơi để tráo đổi ảo ảnh vị trí, khiến mọi đòn tấn công hay kỹ năng nhắm vào người A bị dội sang người B.",
  clairvoyantWolf: "Sói Thấu Thị. Màn đêm cho phép bạn nhìn thấy danh sách tất cả những người chơi đã bị Tiên Tri soi trong đêm vừa qua.",
  mirrorWolf: "Sói Gương. Đêm dựng Gương Quỷ. Bất kỳ kỹ năng hạ sát nào nhắm vào bạn sẽ bị phản chiếu giết chết kẻ ra tay.",
  resonanceWolf: "Sói Cộng Hưởng. Khi toàn bộ bầy Sói đồng lòng chốt 1 mục tiêu cắn ban đêm, đòn cắn sẽ gia tăng sức mạnh xuyên qua lá chắn Bảo Vệ.",
  silencerWolf: "Sói Câm Lặng. Mỗi đêm chọn 1 người chơi để khóa miệng. Nạn nhân sẽ bị cấm gõ tin nhắn vào kênh chat Làng suốt buổi sáng hôm sau.",
  loneWolf: "Sói Cô Độc. Thuộc phe Sói nhưng phải là kẻ duy nhất còn sống sót cuối cùng trên bàn cờ để giành chiến thắng Đơn Lập.",
  solitaireWolf: "Sói Tarot. Mỗi đêm rút 1 lá bài Tarot ngẫu nhiên (Tử Thần, Cuồng Đăng, Cuộc Sống) để ban hiệu ứng đặc biệt cho nạn nhân bị cắn.",
  chaosWolf: "Sói Hỗn Mang. Kích hoạt ma thuật hỗn mang làm xáo trộn mục tiêu bị cắn của bầy Sói sang người chơi lân cận.",
  bloodline: "Sói Già. Mỗi 2 đêm được chọn cắn truyền Huyết Thống cho 1 Dân Làng, biến họ thành Sói thay vì hạ sát.",

  // Third Party Faction
  demonDetective: "Thám Tử Ác Ma. Điều tra ma thuật bóng đêm, vạch trần kẻ mang dã tâm và trừ khử chúng để giành chiến thắng Đơn Lập.",
  missionary: "Nhà Truyền Giáo. Đêm truyền đạo thu phục người chơi gia nhập Giáo Phái. Thắng khi toàn bộ người chơi sống sót đều thuộc Giáo Phái.",
  vampire: "Ma Cà Rồng. Mỗi đêm cắn 1 người chơi để lây nhiễm Huyết Tộc. Mở kênh chat riêng Vampire. Thắng khi số Vampire đạt 50% bàn cờ.",
  arsonist: "Kẻ Phóng Hỏa. Mỗi đêm dội xăng lên 1 người chơi. Khi cần, chọn Châm Lửa thiêu rụi toàn bộ những kẻ đã bị dội xăng cùng lúc!",
  eradicator: "Kẻ Thanh Trừng. Đêm đặt Bẫy Thép vào 1 vị trí. Bất kỳ ai tác động kỹ năng vào mục tiêu mang bẫy sẽ dính bẫy tử vong tức thì.",
  manipulator: "Kẻ Thao Túng. Đêm chọn bẻ hướng kỹ năng từ người A dội sang người B, điều khiển quân cờ theo ý đồ riêng.",
  impostor: "Kẻ Mạo Danh. Đêm chọn mạo danh 1 vai trò khác để tung ra nhát chém chí mạng bí mật.",
  bountyHunter: "Thợ Săn Tiền Thưởng. Đầu game nhận 1 mục tiêu tiền thưởng. Tiêu diệt hoặc dụ làng treo cổ đúng mục tiêu đó để thắng Đơn Lập.",
  shark: "Cá Mập Tài Chính. Dùng tiền tệ chi phối ban ngày: Có thể mua thêm 2 phiếu bầu hoặc vô hiệu hóa phiếu bầu của 1 người chơi.",
  apprenticeReaper: "Thần Chết Tập Sự. Kế thừa chiếc Lưỡi Hái Tử Thần và kênh chat Tử Thần khi Tử Thần chính thức ngã xuống.",
  serialKiller: "Sát Nhân Cuồng Loạn. Mỗi đêm hạ sát 1 mục tiêu. Đòn chém ma quái xuyên qua lá chắn Bảo Vệ. Thắng khi là kẻ duy nhất sống sót.",
  prime: "Chủ Thần. Đêm lập Khế Ước che chở 2 người chơi, mở kênh chat Khế Ước. Thắng khi giữ mạng cho toàn bộ thành viên Khế Ước.",
  ashenKnight: "Kỵ Sĩ Tro Tàn. Tích lũy sức mạnh từ các linh hồn đã chết. Khi đạt 3 linh hồn, mở khóa kỹ năng Càn Quét diệt trừ kẻ thù.",
  cat: "Mèo Thần Thoại. Đêm có thể chọn Cào Xé gây sát thương hoặc Phong Ấn kỹ năng. Khi bị hạ sát, móng mút linh hồn kéo kẻ sát hại chết theo.",
  reaper: "Tử Thần. Mỗi đêm Dự Đoán linh hồn nào sẽ tử vong. Dự đoán đúng 2 lần sẽ thu hoạch đủ linh hồn để chiến thắng Đơn Lập!"
};

export const ALL_ROLES: RoleInfo[] = Object.keys(ROLE_FACTIONS).map(id => ({
  id,
  name: ROLE_NAMES_VI[id] || id,
  faction: ROLE_FACTIONS[id],
  powerRating: ROLE_FACTIONS[id] === 'wolf' ? 4 : ROLE_FACTIONS[id] === 'third' ? 4 : 2,
  icon: ROLE_ICONS[id] || '🔮',
  desc: ROLE_DESCS_VI[id] || 'Mô tả vai trò',
  passive: PASSIVE_ROLES.includes(id)
}));

export const PRESETS: Record<string, Record<string, number>> = {
  classic: { villager: 4, seer: 1, guard: 1, wolf: 2, wolfBoss: 1 }
};

export const getRoleName = (key: string): string => ROLE_NAMES_VI[key] || key;
export const getRoleDesc = (key: string): string => ROLE_DESCS_VI[key] || "Mô tả vai trò";

