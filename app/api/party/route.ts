import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface PartyRoom {
  id: string;
  hostId: string;
  songId: string | null;
  songName: string | null;
  songArtist: string | null;
  songImage: string | null;
  isPlaying: boolean;
  progress: number;
  timestamp: number;
  devices: { id: string; name: string; lastSeen: number }[];
  updatedAt: number;
  createdAt: number;
  songChangedAt: number;
}

// Use globalThis to persist rooms across hot reloads and within warm serverless containers
const globalRooms = (globalThis as unknown as { __partyRooms?: Map<string, PartyRoom> });
if (!globalRooms.__partyRooms) {
  globalRooms.__partyRooms = new Map<string, PartyRoom>();
}
const rooms = globalRooms.__partyRooms;

function cleanOldRooms() {
  const now = Date.now();
  const ids = Array.from(rooms.keys());
  for (const id of ids) {
    const room = rooms.get(id);
    if (room && now - room.updatedAt > 60 * 60 * 1000) {
      rooms.delete(id);
    }
  }
}

function generateRoomId(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let id = "";
  for (let i = 0; i < 6; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

function cleanDevices(room: PartyRoom) {
  room.devices = room.devices.filter(
    (d) => Date.now() - d.lastSeen < 120000
  );
}

export async function GET(request: NextRequest) {
  const roomId = request.nextUrl.searchParams.get("room");
  const deviceId = request.nextUrl.searchParams.get("deviceId");
  const deviceName = request.nextUrl.searchParams.get("deviceName");

  if (!roomId) {
    return NextResponse.json({ error: "Missing room ID" }, { status: 400 });
  }

  cleanOldRooms();
  const room = rooms.get(roomId.toUpperCase());
  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }

  if (deviceId) {
    const existing = room.devices.find((d) => d.id === deviceId);
    if (existing) {
      existing.lastSeen = Date.now();
      if (deviceName) existing.name = deviceName;
    } else {
      room.devices.push({
        id: deviceId,
        name: deviceName || `Device ${room.devices.length + 1}`,
        lastSeen: Date.now(),
      });
    }
    cleanDevices(room);
  }

  room.updatedAt = Date.now();

  return NextResponse.json({
    id: room.id,
    hostId: room.hostId,
    songId: room.songId,
    songName: room.songName,
    songArtist: room.songArtist,
    songImage: room.songImage,
    isPlaying: room.isPlaying,
    progress: room.progress,
    timestamp: room.timestamp,
    devices: room.devices,
    updatedAt: room.updatedAt,
    songChangedAt: room.songChangedAt,
  });
}

export async function POST(request: NextRequest) {
  cleanOldRooms();

  const body = await request.json();
  const {
    action,
    roomId,
    hostId,
    deviceId,
    deviceName,
    songId,
    songName,
    songArtist,
    songImage,
    isPlaying,
    progress,
    timestamp,
  } = body;

  if (action === "create") {
    const id = generateRoomId();
    const now = Date.now();
    const room: PartyRoom = {
      id,
      hostId: hostId || deviceId || "host",
      songId: songId || null,
      songName: songName || null,
      songArtist: songArtist || null,
      songImage: songImage || null,
      isPlaying: isPlaying || false,
      progress: progress || 0,
      timestamp: timestamp || now,
      devices: [
        {
          id: deviceId || "host",
          name: deviceName || "Host Device",
          lastSeen: now,
        },
      ],
      updatedAt: now,
      createdAt: now,
      songChangedAt: now,
    };
    rooms.set(id, room);
    return NextResponse.json({ roomId: id, room });
  }

  if (action === "update" && roomId) {
    const room = rooms.get(roomId.toUpperCase());
    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    const songChanged = songId !== undefined && songId !== room.songId;

    if (songId !== undefined) room.songId = songId;
    if (songName !== undefined) room.songName = songName;
    if (songArtist !== undefined) room.songArtist = songArtist;
    if (songImage !== undefined) room.songImage = songImage;
    if (isPlaying !== undefined) room.isPlaying = isPlaying;
    if (progress !== undefined) room.progress = progress;
    if (timestamp !== undefined) room.timestamp = timestamp;
    if (songChanged) room.songChangedAt = Date.now();
    room.updatedAt = Date.now();

    if (deviceId) {
      const existing = room.devices.find((d) => d.id === deviceId);
      if (existing) {
        existing.lastSeen = Date.now();
      } else {
        room.devices.push({
          id: deviceId,
          name: deviceName || `Device ${room.devices.length + 1}`,
          lastSeen: Date.now(),
        });
      }
    }
    cleanDevices(room);

    return NextResponse.json({ room });
  }

  if (action === "leave" && roomId && deviceId) {
    const room = rooms.get(roomId.toUpperCase());
    if (room) {
      room.devices = room.devices.filter((d) => d.id !== deviceId);
      if (room.devices.length === 0) {
        rooms.delete(roomId.toUpperCase());
      }
    }
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
