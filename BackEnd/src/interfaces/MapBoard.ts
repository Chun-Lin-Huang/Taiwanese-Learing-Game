export interface MapBoard {
  _id?: string;
  name: string;
  image?: {
    url?: string;
    filename?: string;
    size?: number;
    mimeType?: string;
  };
  start_node: string;
  max_players: number;
  version: number;
  createdAt?: Date;
  updatedAt?: Date;
}
