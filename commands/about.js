export const description = `about\n
    Display information about the terminal.\n
    Shows information about this fake Ubuntu terminal built in JavaScript.\n
    Arguments:
      None\n
    Exit Status:
    Returns success (0) after displaying the information.`;


export default function about(write) {
    write(`Welcome to my terminal portfolio — a unique, interactive take on showcasing my work. Inspired by the simplicity of a Unix shell, this emulator highlights my projects and experience in a fun and engaging way.\n
While I'm not building 3D worlds like Bruno Simon, this project pushed my JavaScript skills and helped me grow as a developer. It currently supports basic commands, and I'm actively working on expanding its features for a richer, more dynamic user experience.\n
Explore around and get to know my work!`);
  }
