import { NextRequest, NextResponse } from "next/server";

interface PartyRoom {
  id: string;
  hostId: string;
  songId: string | null;
  songName: string | null;
  songArtist: string | null;
  songImage: string | null;
  isPlaying: boolean;
  progress: number;
  devices: { id: string; name: string; lastSeen: number }[];
  updatedAt: number;
  createdAt: number;
}

const rooms = new Map<string, PartyRoom>();

function cleanOldRooms() {
  const now = Date.now();
  const ids = Array.from(rooms.keys());
  ids.forEach((id) => {
    const room = rooms.get(id);
    if (room && now - room.updatedAt > 30 * 60 * 1000) {
      rooms.delete(id);
    }
  });
}

function generateRoomId(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let id = "";
  for (let i = 0; i < 6; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

export async function GET(request: NextRequest) {
  const roomId = request.nextUrl.searchParams.get("room");
  const deviceId = request.nextUrl.searchParams.get("deviceId");
  const deviceName = request.nextUrl.searchParams.get("deviceName");

  if (!roomId) {
    return NextResponse.json({ error: "Missing room ID" }, { status: 400 });
  }

  cleanOldRooms();
  const room = rooms.get(roomId);
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
    room.devices = room.devices.filter(
      (d) => Date.now() - d.lastSeen < 60000
    );
  }

  return NextResponse.json({
    id: room.id,
    hostId: room.hostId,
    songId: room.songId,
    songName: room.songName,
    songArtist: room.songArtist,
    songImage: room.songImage,
    isPlaying: room.isPlaying,
    progress: room.progress,
    devices: room.devices,
    updatedAt: room.updatedAt,
  });
}

export async function POST(request: NextRequest) {
  cleanOldRooms();

  const body = await request.json();
  const { action, roomId, hostId, deviceId, deviceName, songId, songName, songArtist, songImage, isPlaying, progress } = body;

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
      devices: [
        {
          id: deviceId || "host",
          name: deviceName || "Host Device",
          lastSeen: now,
        },
      ],
      updatedAt: now,
      createdAt: now,
    };
    rooms.set(id, room);
    return NextResponse.json({ roomId: id, room });
  }

  if (action === "update" && roomId) {
    const room = rooms.get(roomId);
    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    if (songId !== undefined) room.songId = songId;
    if (songName !== undefined) room.songName = songName;
    if (songArtist !== undefined) room.songArtist = songArtist;
    if (songImage !== undefined) room.songImage = songImage;
    if (isPlaying !== undefined) room.isPlaying = isPlaying;
    if (progress !== undefined) room.progress = progress;
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
    room.devices = room.devices.filter(
      (d) => Date.now() - d.lastSeen < 60000
    );

    return NextResponse.json({ room });
  }

  if (action === "leave" && roomId && deviceId) {
    const room = rooms.get(roomId);
    if (room) {
      room.devices = room.devices.filter((d) => d.id !== deviceId);
      if (room.devices.length === 0) {
        rooms.delete(roomId);
      }
    }
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
