export class GamePad {
  constructor() {
    this.supported =
      (navigator.webkitGetGamepads && navigator.webkitGetGamepads()) ||
      !!navigator.webkitGamepads ||
      !!navigator.mozGamepads ||
      !!navigator.msGamepads ||
      !!navigator.gamepads ||
      (navigator.getGamepads && navigator.getGamepads());

    this.ticking = false;

    // Recommended deadzones for Xbox One controller
    this.RIGHT_AXIS_THRESHOLD = 7849 / 32767.0;
    this.LEFT_AXIS_THRESHOLD = 8689 / 32767.0;
    this.TRIGGER_AXIS_THRESHOLD = 30 / 32767.0;

    this.SPACEMOUSE_THRESHOLD = 5 / 32767.0;

    this.gamepads = [];
    this.prevRawGamepadTypes = [];
    this.prevTimestamps = [];

    this.init();
  }

  init() {
    if (this.supported) {
      // Older Firefox
      window.addEventListener('MozGamepadConnected', (e) =>
        this.onGamepadConnect(e),
        false
      );
      window.addEventListener('MozGamepadDisconnected', (e) =>
        this.onGamepadDisconnect(e),
        false
      );

      // W3C Specification
      window.addEventListener('gamepadconnected', (e) =>
        this.onGamepadConnect(e),
        false
      );
      window.addEventListener('gamepaddisconnected', (e) =>
        this.onGamepadDisconnect(e),
        false
      );

      // Chrome
      if (
        navigator.webkitGetGamepads &&
        navigator.webkitGetGamepads()
      ) {
        this.startPolling();
      }

      // CocoonJS
      if (navigator.getGamepads && navigator.getGamepads()) {
        this.startPolling();
      }
    } else {
      console.log('Gamepad API not supported or not detected!');
    }
  }

  startPolling() {
    console.log('Controller Connected!');
    if (!this.ticking) {
      this.ticking = true;
      this.update();
    }
  }

  stopPolling() {
    console.log('Controller Disconnected!');
    this.ticking = false;
  }

  update() {
    this.pollStatus();
    if (this.ticking) {
      this.pollJoysticks();
    }
  }

  pollStatus() {
    this.pollGamepads();
    for (let i in this.gamepads) {
      let gamepad = this.gamepads[i];
      if (gamepad.timestamp && gamepad.timestamp === this.prevTimestamps[i]) {
        continue;
      }
      this.prevTimestamps[i] = gamepad.timestamp;
    }
  }

  pollGamepads() {
    let rawGamepads =
      (navigator.webkitGetGamepads && navigator.webkitGetGamepads()) ||
      navigator.webkitGamepads ||
      navigator.mozGamepads ||
      navigator.msGamepads ||
      navigator.gamepads ||
      (navigator.getGamepads && navigator.getGamepads());
    if (rawGamepads) {
      this.gamepads = [];
      for (let i = 0, max = rawGamepads.length; i < max; i++) {
        if (typeof rawGamepads[i] !== this.prevRawGamepadTypes[i]) {
          this.prevRawGamepadTypes[i] = typeof rawGamepads[i];
        }
        if (rawGamepads[i]) {
          this.gamepads.push(rawGamepads[i]);
        }
      }
    }
  }

  pollJoysticks() {
    let pad = 0;
  
    // Reset all input to 0
    let pan = { x: 0, y: 0, z: 0 };
    let roll = { x: 0, y: 0, z: 0 };
  
    if (this.gamepads[pad]) {
      let panX = this.gamepads[pad].axes[0]; // Pan  X || Left X
      let panY = this.gamepads[pad].axes[1]; // Pan  Y || Left Y
      let panZ = this.gamepads[pad].axes[2]; // Pan  Z || Right X
  
      let rollX = this.gamepads[pad].axes[3]; // Roll X || Right Y
      let rollY = this.gamepads[pad].axes[4]; // Roll Y || Trigger Left
      let rollZ = this.gamepads[pad].axes[5]; // Roll Z || Trigger Right
  
      // Log the input values for axes
      console.log("Pan X:", panX);
      console.log("Pan Y:", panY);
      console.log("Pan Z:", panZ);
  
      console.log("Roll X:", rollX);
      console.log("Roll Y:", rollY);
      console.log("Roll Z:", rollZ);
  
      // Log the button presses
      const buttons = this.gamepads[pad].buttons;
      buttons.forEach((button, index) => {
        console.log(`Button ${index}:`, button.pressed);
      });
  
      if (panX < -this.SPACEMOUSE_THRESHOLD || panX > this.SPACEMOUSE_THRESHOLD) {
        pan.x = panX;
      }
  
      if (panY < -this.SPACEMOUSE_THRESHOLD || panY > this.SPACEMOUSE_THRESHOLD) {
        pan.y = panY;
      }
  
      if (panZ < -this.SPACEMOUSE_THRESHOLD || panZ > this.SPACEMOUSE_THRESHOLD) {
        pan.z = panZ;
      }
  
      if (rollX < -this.SPACEMOUSE_THRESHOLD || rollX > this.SPACEMOUSE_THRESHOLD) {
        roll.x = rollX;
      }
  
      if (rollY < -this.SPACEMOUSE_THRESHOLD || rollY > this.SPACEMOUSE_THRESHOLD) {
        roll.y = rollY;
      }
  
      if (rollZ < -this.SPACEMOUSE_THRESHOLD || rollZ > this.SPACEMOUSE_THRESHOLD) {
        roll.z = rollZ;
      }
    }
  }

  onGamepadConnect(event) {
    console.log(event);
    let gamepad = event.gamepad;
    this.gamepads[event.gamepad.id] = gamepad;
    this.startPolling();
  }

  onGamepadDisconnect(event) {
    this.gamepads[event.gamepad.id] = null;
    if (this.gamepads.length === 0) {
      this.stopPolling();
    }
  }
}

export const gamePad = new GamePad();