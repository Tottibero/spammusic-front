export interface Vote {
    id: string; // o el tipo correcto, como number
    user: {
      username: string;
    };
    rate: number;
    cover: number;
  }
  