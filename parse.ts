import { readdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";

interface LibraryItem {
  artist: string;
  album: string;
  track: string;
  uri: string;
}

interface Library {
  tracks: LibraryItem[];
}

interface StreamingHistoryItem {
  endTime: string;
  artistName: string;
  trackName: string;
  msPlayed: number;
}

export const parse = ({
  directory,
  threshold,
}: {
  directory: string;
  threshold: number;
}) => {
  const streamingHistoryFiles = readdirSync(
    path.join(__dirname, directory)
  ).filter(
    (name: string) =>
      name.startsWith("StreamingHistory") && name.endsWith(".json")
  );

  const streamingHistoryItems = streamingHistoryFiles
    .map((name: string) => {
      const buffer: string = readFileSync(
        path.join(__dirname, directory, name)
      ) as unknown as string;
      return JSON.parse(buffer) as StreamingHistoryItem[];
    })
    .flat();

  const streamingHistoryHashObject: { [key: string]: StreamingHistoryItem } =
    streamingHistoryItems.reduce((acc: any, item: StreamingHistoryItem) => {
      const key = `${item.artistName} - ${item.trackName}`;
      if (Boolean(acc[key])) {
        acc[key].msPlayed += item.msPlayed;
      } else {
        acc[key] = item;
      }
      return acc;
    }, {});

  const streamingHistoryList = Object.values(streamingHistoryHashObject)
    .sort((a, b) => (a.msPlayed < b.msPlayed ? +1 : -1))
    .filter(({ msPlayed }) => msPlayed > threshold);

  const { tracks }: Library = JSON.parse(
    readFileSync(
      path.join(__dirname, directory, "YourLibrary.json")
    ) as unknown as string
  ) as Library;

  writeFileSync(
    path.join(__dirname, "library.txt"),
    tracks.map(({ artist, track }) => [artist, track].join(" - ")).join("\n")
  );
  writeFileSync(
    path.join(__dirname, "streamingHistoryTop.txt"),
    streamingHistoryList
      .map(({ artistName, trackName }) => [artistName, trackName].join(" - "))
      .join("\n")
  );
  writeFileSync(
    path.join(__dirname, "streamingHistoryTopWithTime.txt"),
    streamingHistoryList
      .map(({ artistName, trackName, msPlayed }) =>
        [artistName, trackName, msPlayed].join(" - ")
      )
      .join("\n")
  );
  console.log(
    `files written. Library: ${tracks.length} rows. Streaming History: ${streamingHistoryList.length}`
  );
};
