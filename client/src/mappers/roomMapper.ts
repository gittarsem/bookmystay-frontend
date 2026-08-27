import { MOCK_ROOMS } from "@/lib/mockData";

export function mapRoom(room: any, index: number) {
  const template =
    MOCK_ROOMS[index % MOCK_ROOMS.length];

  return {
    ...template,
    capacity: room.capacity,
    type: room.roomType,
    price: room.price,
  };
}

export function mapRooms(rooms: any[] = []) {
  const roomTypes = new Map<string, any>();

  rooms.forEach((room, index) => {
    const type = room.roomType;

    if (!type || roomTypes.has(type)) {
      return;
    }

    roomTypes.set(
      type,
      mapRoom(room, index)
    );
  });

  return Array.from(
    roomTypes.values()
  );
}