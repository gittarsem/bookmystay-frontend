import { MOCK_ROOMS } from "@/lib/mockData";

export function mapRoom(room: any, index: number) {
  const template = MOCK_ROOMS[index % MOCK_ROOMS.length];

  return {
    ...template,

    capacity: room.capacity,

    type: room.roomType,

    price: room.price,
  };
}

export function mapRooms(rooms: any[] = []) {
  return rooms.map(mapRoom);
}