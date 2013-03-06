// Edit by John Chawrai Technology
(function() {
  var Command, RoomHelper, User, afkCheck, afksCommand, allAfksCommand, announceCurate, antispam, apiHooks, avgVoteRatioCommand, badQualityCommand, beggar, chatCommandDispatcher, chatUniversals, cmdHelpCommand, cmds, commandsCommand, cookieCommand, data, dieCommand, disconnectLookupCommand, downloadCommand, fbCommand, forceSkipCommand, handleNewSong, handleUserJoin, handleUserLeave, handleVote, hook, hugCommand, initEnvironment, initHooks, initialize, lockCommand, msToStr, newSongsCommand, overplayedCommand, popCommand, populateUserData, protectCommand, punishCommand, pupOnline, pushCommand, reloadCommand, resetAfkCommand, roomHelpCommand, rulesCommand, settings, skipCommand, sourceCommand, statusCommand, swapCommand, tacoCommand, themeCommand, undoHooks, unhook, unhookCommand, unlockCommand, updateVotes, uservoiceCommand, voteRatioCommand, whyMehCommand, whyWootCommand, wootCommand,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  settings = (function() {

    function settings() {
      this.implode = __bind(this.implode, this);

      this.intervalMessages = __bind(this.intervalMessages, this);

      this.startAfkInterval = __bind(this.startAfkInterval, this);

      this.setInternalWaitlist = __bind(this.setInternalWaitlist, this);

      this.userJoin = __bind(this.userJoin, this);

      this.getRoomUrlPath = __bind(this.getRoomUrlPath, this);

      this.startup = __bind(this.startup, this);

    }
    settings.prototype.currentDJ = {};

    settings.prototype.currentsong = {};

    settings.prototype.users = {};

    settings.prototype.djs = [];

    settings.prototype.mods = [];

    settings.prototype.host = [];

    settings.prototype.hasWarned = false;

    settings.prototype.currentwoots = 0;

    settings.prototype.currentmehs = 0;

    settings.prototype.currentcurates = 0;

    settings.prototype.roomUrlPath = null;

    settings.prototype.internalWaitlist = [];

    settings.prototype.userDisconnectLog = [];

    settings.prototype.voteLog = {};

    settings.prototype.seshOn = false;

    settings.prototype.forceSkip = false;

    settings.prototype.seshMembers = [];

    settings.prototype.launchTime = null;

    settings.prototype.totalVotingData = {
      woots: 0,
      mehs: 0,
      curates: 0
    };

    settings.prototype.pupScriptUrl = '';

    

    settings.prototype.songIntervalMessages = [
      {
        interval: 15,
        offset: 0,
        msg: "I'm a bot!"
      }
    ];

    settings.prototype.songCount = 0;

    settings.prototype.startup = function() {
      this.launchTime = new Date();
      return this.roomUrlPath = this.getRoomUrlPath();
    };

    settings.prototype.getRoomUrlPath = function() {
      return window.location.pathname.replace(/\//g, '');
    };

    settings.prototype.newSong = function() {
      this.totalVotingData.woots += this.currentwoots;
      this.totalVotingData.mehs += this.currentmehs;
      this.totalVotingData.curates += this.currentcurates;
      this.setInternalWaitlist();
      this.currentsong = API.getMedia();
      if (this.currentsong !== null) {
        return this.currentsong;
      } else {
        return false;
      }
    };

    settings.prototype.userJoin = function(u) {
      var userIds, _ref;
      userIds = Object.keys(this.users);
      if (_ref = u.id, __indexOf.call(userIds, _ref) >= 0) {
        return this.users[u.id].inRoom(true);
      } else {
        this.users[u.id] = new User(u);
        return this.voteLog[u.id] = {};
      }
    };

    settings.prototype.setInternalWaitlist = function() {
      var boothWaitlist, fullWaitList, lineWaitList;
      boothWaitlist = API.getDJs().slice(1);
      lineWaitList = API.getWaitList();
      fullWaitList = boothWaitlist.concat(lineWaitList);
      return this.internalWaitlist = fullWaitList;
    };

    settings.prototype.activity = function(obj) {
      if (obj.type === 'message') {
        return this.users[obj.fromID].updateActivity();
      }
    };

    settings.prototype.startAfkInterval = function() {
      return this.afkInterval = setInterval(afkCheck, 2000);
    };

    settings.prototype.intervalMessages = function() {
      var msg, _i, _len, _ref, _results;
      this.songCount++;
      _ref = this.songIntervalMessages;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        msg = _ref[_i];
        if (((this.songCount + msg['offset']) % msg['interval']) === 0) {
          _results.push(API.sendChat(msg['msg']));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    settings.prototype.implode = function() {
      var item, val;
      for (item in this) {
        val = this[item];
        if (typeof this[item] === 'object') {
          delete this[item];
        }
      }
      return clearInterval(this.afkInterval);
    };

    settings.prototype.lockBooth = function(callback) {
      if (callback == null) {
        callback = null;
      }
      return $.ajax({
        url: "http://plug.dj/_/gateway/room.update_options",
        type: 'POST',
        data: JSON.stringify({
          service: "room.update_options",
          body: [
            this.roomUrlPath, {
              "boothLocked": true,
              "waitListEnabled": true,
              "maxPlays": 1,
              "maxDJs": 5
            }
          ]
        }),
        async: this.async,
        dataType: 'json',
        contentType: 'application/json'
      }).done(function() {
        if (callback != null) {
          return callback();
        }
      });
    };

    settings.prototype.unlockBooth = function(callback) {
      if (callback == null) {
        callback = null;
      }
      return $.ajax({
        url: "http://plug.dj/_/gateway/room.update_options",
        type: 'POST',
        data: JSON.stringify({
          service: "room.update_options",
          body: [
            this.roomUrlPath, {
              "boothLocked": false,
              "waitListEnabled": true,
              "maxPlays": 1,
              "maxDJs": 5
            }
          ]
        }),
        async: this.async,
        dataType: 'json',
        contentType: 'application/json'
      }).done(function() {
        if (callback != null) {
          return callback();
        }
      });
    };

    return settings;

  })();

  data = new settings();

  User = (function() {

    User.prototype.afkWarningCount = 0;

    User.prototype.lastWarning = null;

    User.prototype["protected"] = false;

    User.prototype.isInRoom = true;

    function User(user) {
      this.user = user;
      this.updateVote = __bind(this.updateVote, this);

      this.inRoom = __bind(this.inRoom, this);

      this.notDj = __bind(this.notDj, this);

      this.warn = __bind(this.warn, this);

      this.getIsDj = __bind(this.getIsDj, this);

      this.getWarningCount = __bind(this.getWarningCount, this);

      this.getUser = __bind(this.getUser, this);

      this.getLastWarning = __bind(this.getLastWarning, this);

      this.getLastActivity = __bind(this.getLastActivity, this);

      this.updateActivity = __bind(this.updateActivity, this);

      this.init = __bind(this.init, this);

      this.init();
    }

    User.prototype.init = function() {
      return this.lastActivity = new Date();
    };

    User.prototype.updateActivity = function() {
      this.lastActivity = new Date();
      this.afkWarningCount = 0;
      return this.lastWarning = null;
    };

    User.prototype.getLastActivity = function() {
      return this.lastActivity;
    };

    User.prototype.getLastWarning = function() {
      if (this.lastWarning === null) {
        return false;
      } else {
        return this.lastWarning;
      }
    };

    User.prototype.getUser = function() {
      return this.user;
    };

    User.prototype.getWarningCount = function() {
      return this.afkWarningCount;
    };

    User.prototype.getIsDj = function() {
      var DJs, dj, _i, _len;
      DJs = API.getDJs();
      for (_i = 0, _len = DJs.length; _i < _len; _i++) {
        dj = DJs[_i];
        if (this.user.id === dj.id) {
          return true;
        }
      }
      return false;
    };

    User.prototype.warn = function() {
      this.afkWarningCount++;
      return this.lastWarning = new Date();
    };

    User.prototype.notDj = function() {
      this.afkWarningCount = 0;
      return this.lastWarning = null;
    };

    User.prototype.inRoom = function(online) {
      return this.isInRoom = online;
    };

    User.prototype.updateVote = function(v) {
      if (this.isInRoom) {
        return data.voteLog[this.user.id][data.currentsong.id] = v;
      }
    };

    return User;

  })();

  RoomHelper = (function() {

    function RoomHelper() {}

    RoomHelper.prototype.lookupUser = function(username) {
      var id, u, _ref;
      _ref = data.users;
      for (id in _ref) {
        u = _ref[id];
        if (u.getUser().username === username) {
          return u.getUser();
        }
      }
      return false;
    };

    RoomHelper.prototype.userVoteRatio = function(user) {
      var songId, songVotes, vote, votes;
      songVotes = data.voteLog[user.id];
      votes = {
        'woot': 0,
        'meh': 0
      };
      for (songId in songVotes) {
        vote = songVotes[songId];
        if (vote === 1) {
          votes['woot']++;
        } else if (vote === -1) {
          votes['meh']++;
        }
      }
      votes['positiveRatio'] = (votes['woot'] / (votes['woot'] + votes['meh'])).toFixed(2);
      return votes;
    };

    return RoomHelper;

  })();

  pupOnline = function() {
    return API.sendChat(":)");
  };

  populateUserData = function() {
    var u, users, _i, _len;
    users = API.getUsers();
    for (_i = 0, _len = users.length; _i < _len; _i++) {
      u = users[_i];
      data.users[u.id] = new User(u);
      data.voteLog[u.id] = {};
    }
  };

  initEnvironment = function() {
    document.getElementById("button-vote-positive").click();
    document.getElementById("button-sound").click();
    Playback.streamDisabled = true;
    return Playback.stop();
  };

  initialize = function() {
    pupOnline();
    populateUserData();
    initEnvironment();
    initHooks();
    data.startup();
    data.newSong();
    return data.startAfkInterval();
  };

  afkCheck = function() {
    var DJs, id, lastActivity, lastWarned, now, oneMinute, secsLastActive, timeSinceLastActivity, timeSinceLastWarning, twoMinutes, user, warnMsg, _ref, _results;
    _ref = data.users;
    _results = [];
    for (id in _ref) {
      user = _ref[id];
      now = new Date();
      lastActivity = user.getLastActivity();
      timeSinceLastActivity = now.getTime() - lastActivity.getTime();
      if (timeSinceLastActivity > data.afkTime) {
        if (user.getIsDj()) {
          secsLastActive = timeSinceLastActivity / 1000;
          if (user.getWarningCount() === 0) {
            user.warn();
            _results.push(API.sendChat("@" + user.getUser().username + ", I haven't seen you chat or vote in at least 12 minutes. Are you AFK?  If you don't show activity in 2 minutes I will remove you."));
          } else if (user.getWarningCount() === 1) {
            lastWarned = user.getLastWarning();
            timeSinceLastWarning = now.getTime() - lastWarned.getTime();
            twoMinutes = 2 * 60 * 1000;
            if (timeSinceLastWarning > twoMinutes) {
              user.warn();
              warnMsg = "@" + user.getUser().username;
              warnMsg += ", I haven't seen you chat or vote in at least 14 minutes now.  This is your second and FINAL warning.  If you do not chat or vote in the next minute I will remove you.";
              _results.push(API.sendChat(warnMsg));
            } else {
              _results.push(void 0);
            }
          } else if (user.getWarningCount() === 2) {
            lastWarned = user.getLastWarning();
            timeSinceLastWarning = now.getTime() - lastWarned.getTime();
            oneMinute = 1 * 60 * 1000;
            if (timeSinceLastWarning > oneMinute) {
              DJs = API.getDJs();
              if (DJs.length > 0 && DJs[0].id !== user.getUser().id) {
                API.sendChat("@" + user.getUser().username + ", you had 2 warnings. Please stay active by chatting or voting.");
                API.moderateRemoveDJ(id);
                _results.push(user.warn());
              } else {
                _results.push(void 0);
              }
            } else {
              _results.push(void 0);
            }
          } else {
            _results.push(void 0);
          }
        } else {
          _results.push(user.notDj());
        }
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  msToStr = function(msTime) {
    var ms, msg, timeAway;
    msg = '';
    timeAway = {
      'days': 0,
      'hours': 0,
      'minutes': 0,
      'seconds': 0
    };
    ms = {
      'day': 24 * 60 * 60 * 1000,
      'hour': 60 * 60 * 1000,
      'minute': 60 * 1000,
      'second': 1000
    };
    if (msTime > ms['day']) {
      timeAway['days'] = Math.floor(msTime / ms['day']);
      msTime = msTime % ms['day'];
    }
    if (msTime > ms['hour']) {
      timeAway['hours'] = Math.floor(msTime / ms['hour']);
      msTime = msTime % ms['hour'];
    }
    if (msTime > ms['minute']) {
      timeAway['minutes'] = Math.floor(msTime / ms['minute']);
      msTime = msTime % ms['minute'];
    }
    if (msTime > ms['second']) {
      timeAway['seconds'] = Math.floor(msTime / ms['second']);
    }
    if (timeAway['days'] !== 0) {
      msg += timeAway['days'].toString() + 'd';
    }
    if (timeAway['hours'] !== 0) {
      msg += timeAway['hours'].toString() + 'h';
    }
    if (timeAway['minutes'] !== 0) {
      msg += timeAway['minutes'].toString() + 'm';
    }
    if (timeAway['seconds'] !== 0) {
      msg += timeAway['seconds'].toString() + 's';
    }
    if (msg !== '') {
      return msg;
    } else {
      return false;
    }
  };

  Command = (function() {

    function Command(msgData) {
      this.msgData = msgData;
      this.init();
    }

    Command.prototype.init = function() {
      this.parseType = null;
      this.command = null;
      return this.rankPrivelege = null;
    };

    Command.prototype.functionality = function(data) {};

    Command.prototype.hasPrivelege = function() {
      var user;
      user = data.users[this.msgData.fromID].getUser();
      switch (this.rankPrivelege) {
        case 'host':
          return user.permission === 5;
        case 'cohost':
          return user.permission >= 4;
        case 'mod':
          return user.permission >= 3;
        case 'manager':
          return user.permission >= 3;
        case 'bouncer':
          return user.permission >= 2;
        case 'featured':
          return user.permission >= 1;
        default:
          return true;
      }
    };

    Command.prototype.commandMatch = function() {
      var command, msg, _i, _len, _ref;
      msg = this.msgData.message;
      if (typeof this.command === 'string') {
        if (this.parseType === 'exact') {
          if (msg === this.command) {
            return true;
          } else {
            return false;
          }
        } else if (this.parseType === 'startsWith') {
          if (msg.substr(0, this.command.length) === this.command) {
            return true;
          } else {
            return false;
          }
        } else if (this.parseType === 'contains') {
          if (msg.indexOf(this.command) !== -1) {
            return true;
          } else {
            return false;
          }
        }
      } else if (typeof this.command === 'object') {
        _ref = this.command;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          command = _ref[_i];
          if (this.parseType === 'exact') {
            if (msg === command) {
              return true;
            }
          } else if (this.parseType === 'startsWith') {
            if (msg.substr(0, command.length) === command) {
              return true;
            }
          } else if (this.parseType === 'contains') {
            if (msg.indexOf(command) !== -1) {
              return true;
            }
          }
        }
        return false;
      }
    };

    Command.prototype.evalMsg = function() {
      if (this.commandMatch() && this.hasPrivelege()) {
        this.functionality();
        return true;
      } else {
        return false;
      }
    };

    return Command;

  })();

  protectCommand = (function(_super) {

    __extends(protectCommand, _super);

    function protectCommand() {
      return protectCommand.__super__.constructor.apply(this, arguments);
    }

    protectCommand.prototype.init = function() {
      this.command = '/protect';
      this.parseType = 'startsWith';
      return this.rankPrivelege = 'mod';
    };

    protectCommand.prototype.functionality = function() {
      var id, msg, user, username, _ref;
      msg = this.msgData.message;
      if (msg.length > 9) {
        username = msg.substring(10);
        _ref = data.users;
        for (id in _ref) {
          user = _ref[id];
          if (user.getUser().username === username) {
            user["protected"] = true;
            API.sendChat("I shall protect you @" + username + " (I just wont kick you)");
            return;
          }
        }
      }
      API.sendChat("That aint no name I ever did see");
    };

    return protectCommand;

  })(Command);

  cmdHelpCommand = (function(_super) {

    __extends(cmdHelpCommand, _super);

    function cmdHelpCommand() {
      return cmdHelpCommand.__super__.constructor.apply(this, arguments);
    }

    cmdHelpCommand.prototype.init = function() {
      this.command = '/cmdhelp';
      this.parseType = 'startsWith';
      return this.rankPrivelege = 'user';
    };

    cmdHelpCommand.prototype.functionality = function() {
      var msg, param, resp;
      msg = this.msgData.message;
      resp = '';
      if (msg.length > 9) {
        param = msg.substring(9);
        switch (param) {
          case "hugs pup":
            resp = "You give me a hug!";
            break;
          case "rapes pup":
            resp = "er... thats... not a command... please";
            break;
          case "taco":
            resp = "order a yummy taco.  simply say 'taco' or give on to someone else by saying 'taco @user'";
            break;
          case "cookie":
            resp = "Mod only command.  Reward a user with a sweet treat!  Syntax: cookie @user";
            break;
          case "punish":
            resp = "Mod only command.  Punish a user in one of several methods.  For naughty users.  Syntax: punish @user";
            break;
          case "/newsongs":
            resp = "find new songs by checking out one of 40+ dubstep channels that post new music daily";
            break;
          case "/whywoot":
            resp = "DJ all day without throwing your life away clicking woot every 3 minutes.  Learn how and get the necessary tools";
            break;
          case "/theme":
            resp = "Learn what genres of music are generally accepted here.  Don't forget to check if your song is in /overplayed though";
            break;
          case "/rules":
            resp = "Room rules.  Duh";
            break;
          case "/roomhelp":
            resp = "Information about the room for the newer folk.";
            break;
          case "/source":
            resp = "About the bot and the code that produced it";
            break;
          case "/sourcecode":
            resp = "About the bot and the code that produced it";
            break;
          case "/author":
            resp = "About the bot and the code that produced it";
            break;
          case "/woot":
            resp = "Remind users to hit woot so they don't get removed.  either type /woot or /woot @user";
            break;
          case ".128":
            resp = "Mod only command. Flags songs that are bad quality.";
            break;
          case "/tableflip":
            resp = "... flips a table";
            break;
          case "/tablefix":
            resp = "... fixes a table";
            break;
          case "/download":
            resp = "Provides a link to find downloads of mp3 of current song";
            break;
          case "/smokesesh":
            resp = "For when ya just wanna get high";
            break;
          case "/smoke":
            resp = "doobies";
            break;
          case "/dab":
            resp = "WOLVES uses this";
            break;
          case "/afks":
            resp = "List current DJs on deck that haven't chatted or voted in 5+ minutes";
            break;
          case "/allafks":
            resp = "List all users in room that haven't chatted or voted in 10+ minutes";
            break;
          case "/status":
            resp = "Uptime and total song stats";
            break;
          case "/unhook events all":
            resp = "Host only command.  It's complicated";
            break;
          case "/die":
            resp = "Host only command. Makes bot go bye bye";
            break;
          case "/reload":
            resp = "Host only command. Reload pup's script";
            break;
          case "/lock":
            resp = "Mod only command. Locks booth";
            break;
          case "/unlock":
            resp = "Mod only command. Unlocks booth";
            break;
          case "/overplayed":
            resp = "Links users to our overplayed song list";
            break;
          case "/whymeh":
            resp = "Explains to users why they should be mehing every song";
            break;
          case "/skip":
            resp = "Mod only command.  Skips song.  Works for skipping invisible DJs.";
            break;
          case "/commands":
            resp = "Lists all commands.  Will only list commands available to caller's user class (user, mod, or host)";
            break;
          case "/resetafk":
            resp = "Mod only command.  Resets AFK timer for user.  Syntax: /resetafk @USER";
            break;
          case "/forceskip":
            resp = "Host only command.  Make pup skip songs when they are supposed to end (addresses triangles of death issue). Syntax: /forceskip [enable|disable]";
            break;
          case "/fb":
            resp = "Links to Dubstep Den's facebook page";
            break;
          case "/uservoice":
            resp = "Links to Dubstep Den's uservoice page";
            break;
          case "/dclookup":
            resp = "Mod only command.  Looks up user for a log of their last disconnect. Syntax: /dclookup @USER";
            break;
          case "/reminder":
            resp = "Mod only command.  Set reminder for x songs from now.  For users that dc'd mainly.  Syntax: /reminder \"MSG\" [numsongs]";
            break;
          case "/voteratio":
            resp = "Mod only command.  See woot & meh count for user since bot launch.  Syntax: /voteratio @USER";
            break;
          case "/avgvoteratio":
            resp = "Mod only command.  See average voting ratio of every present user in room. Syntax: /avgvoteratio";
            break;
          case "/cmdhelp":
            resp = "Looks like you got it down";
            break;
          case "/pop":
            resp = "Mod only command.  Removes last person on deck";
            break;
          case "/push":
            resp = "Mod only command.  Puts user on deck. Syntax: /push @user";
            break;
          default:
            resp = "That is nothing.  That is not a thing.";
        }
      } else {
        resp = "Use this command to learn how use other commands.  Syntax: /cmdhelp [/CMD]";
      }
      return API.sendChat(resp);
    };

    return cmdHelpCommand;

  })(Command);

  hugCommand = (function(_super) {

    __extends(hugCommand, _super);

    function hugCommand() {
      return hugCommand.__super__.constructor.apply(this, arguments);
    }

    hugCommand.prototype.init = function() {
      this.command = 'hugs pup';
      this.parseType = 'exact';
      return this.rankPrivelege = 'user';
    };

    hugCommand.prototype.functionality = function() {
      return API.sendChat("hugs @" + this.msgData['from']);
    };

    return hugCommand;

  })(Command);

  tacoCommand = (function(_super) {

    __extends(tacoCommand, _super);

    function tacoCommand() {
      return tacoCommand.__super__.constructor.apply(this, arguments);
    }

    tacoCommand.prototype.init = function() {
      this.command = 'taco';
      this.parseType = 'startsWith';
      return this.rankPrivelege = 'user';
    };

    tacoCommand.prototype.randomTaco = function() {
      var r, tacos;
      tacos = ["Mexican Pizza", "Chicken Soft Taco", "Double Decker Taco", "Volcano Taco Supreme", "Crunchy Taco Supreme", "Grilled Steak Soft Taco", "Cheesy Gordita Crunch", "Doritos Locos Taco"];
      r = Math.floor(Math.random() * tacos.length);
      return tacos[r];
    };

    tacoCommand.prototype.functionality = function() {
      var msg, taco, tacoName;
      msg = this.msgData.message;
      taco = this.randomTaco();
      if (msg.substring(5, 6) === "@") {
        tacoName = msg.substring(6);
        if (tacoName === '#Wolf Pup') {
          return API.sendChat("No thanks I'll get fat :(");
        } else {
          return API.sendChat("Yo @" + tacoName + ", " + this.msgData.from + " just gave you a " + taco + "!");
        }
      } else {
        return API.sendChat("Yo @" + this.msgData.from + ", here is your " + taco + "!");
      }
    };

    return tacoCommand;

  })(Command);

  cookieCommand = (function(_super) {

    __extends(cookieCommand, _super);

    function cookieCommand() {
      return cookieCommand.__super__.constructor.apply(this, arguments);
    }

    cookieCommand.prototype.init = function() {
      this.command = 'cookie';
      this.parseType = 'startsWith';
      return this.rankPrivelege = 'mod';
    };

    cookieCommand.prototype.getCookie = function() {
      var c, cookies;
      cookies = ["a chocolate chip cookie", "a sugar cookie", "an oatmeal raisin cookie", "a 'special' brownie", "an animal cracker", "a scooby snack", "a blueberry muffin", "a cupcake"];
      c = Math.floor(Math.random() * cookies.length);
      return cookies[c];
    };

    cookieCommand.prototype.functionality = function() {
      var msg, r, user;
      msg = this.msgData.message;
      r = new RoomHelper();
      if (msg.length > 8) {
        user = r.lookupUser(msg.substr(8));
        if (user === false) {
          API.sendChat("/em doesn't see '" + msg.substr(8) + "' in room and eats cookie himself");
          return false;
        } else {
          return API.sendChat("@" + user.username + ", @" + this.msgData.from + " has rewarded you with " + this.getCookie() + ". Enjoy.");
        }
      }
    };

    return cookieCommand;

  })(Command);

  punishCommand = (function(_super) {

    __extends(punishCommand, _super);

    function punishCommand() {
      return punishCommand.__super__.constructor.apply(this, arguments);
    }

    punishCommand.prototype.init = function() {
      this.command = 'punish';
      this.parseType = 'startsWith';
      return this.rankPrivelege = 'mod';
    };

    punishCommand.prototype.getPunishment = function(username) {
      var p, punishment, punishments;
      punishments = ["/me rubs sandpaper on @{victim}'s scrotum", "/me pokes @{victim} in the eyes", "/me throws sand in @{victim}'s eyes", "/me makes @{victim}'s mother cry", "/me penetrates @{victim} with a sharpie", "/me pinches @{victim}'s nipples super hard", "/me gives @{victim} a wet willy"];
      p = Math.floor(Math.random() * punishments.length);
      punishment = punishments[p].replace('{victim}', username);
      return punishment;
    };

    punishCommand.prototype.functionality = function() {
      var msg, name, r, user;
      msg = this.msgData.message;
      r = new RoomHelper();
      if (msg.length > 8) {
        name = msg.substr(8);
        user = r.lookupUser(name);
        if (user === false) {
          API.sendChat("/me punishes @" + this.msgData.from + " for getting the syntax wrong.");
          return setTimeout(function() {
            return API.sendChat("Seriously though, I don't recognize the username '" + name + "'");
          }, 750);
        } else {
          if (user.owner) {
            return API.sendChat(this.getPunishment(this.msgData.from));
          } else {
            return API.sendChat(this.getPunishment(user.username));
          }
        }
      }
    };

    return punishCommand;

  })(Command);

  newSongsCommand = (function(_super) {

    __extends(newSongsCommand, _super);

    function newSongsCommand() {
      return newSongsCommand.__super__.constructor.apply(this, arguments);
    }

    newSongsCommand.prototype.init = function() {
      this.command = '/newsongs';
      this.parseType = 'startsWith';
      return this.rankPrivelege = 'user';
    };

    newSongsCommand.prototype.functionality = function() {
      var arts, cMedia, chans, chooseRandom, mChans, msg, selections, u, _ref;
      mChans = this.memberChannels.slice(0);
      chans = this.channels.slice(0);
      arts = this.artists.slice(0);
      chooseRandom = function(list) {
        var l, r;
        l = list.length;
        r = Math.floor(Math.random() * l);
        return list.splice(r, 1);
      };
      selections = {
        channels: [],
        artist: ''
      };
      u = data.users[this.msgData.fromID].getUser().username;
      if (u.indexOf("MistaDubstep") !== -1) {
        selections['channels'].push('MistaDubstep');
      } else if (u.indexOf("Underground Promotions") !== -1) {
        selections['channels'].push('UndergroundDubstep');
      } else {
        selections['channels'].push(chooseRandom(mChans));
      }
      selections['channels'].push(chooseRandom(chans));
      selections['channels'].push(chooseRandom(chans));
      cMedia = API.getMedia();
      if ((cMedia != null) && (_ref = cMedia.author, __indexOf.call(arts, _ref) >= 0)) {
        selections['artist'] = cMedia.author;
      } else {
        selections['artist'] = chooseRandom(arts);
      }
      msg = "Everyone's heard that " + selections['artist'] + " track! Get new music from http://youtube.com/" + selections['channels'][0] + " http://youtube.com/" + selections['channels'][1] + " or http://youtube.com/" + selections['channels'][2];
      return API.sendChat(msg);
    };

    newSongsCommand.prototype.memberChannels = ["JitterStep", "MistaDubstep", "DubStationPromotions", "UndergroundDubstep", "JesusDied4Dubstep", "DarkstepWarrior", "BombshockDubstep", "Sharestep"];

    newSongsCommand.prototype.channels = ["BassRape", "Mudstep", "WobbleCraftDubz", "MonstercatMedia", "UKFdubstep", "DropThatBassline", "Dubstep", "VitalDubstep", "AirwaveDubstepTV", "EpicNetworkMusic", "NoOffenseDubstep", "InspectorDubplate", "ReptileDubstep", "MrMoMDubstep", "FrixionNetwork", "IcyDubstep", "DubstepWeed", "VhileMusic", "LessThan3Dubstep", "PleaseMindTheDUBstep", "ClownDubstep", "TheULTRADUBSTEP", "DuBM0nkeyz", "DubNationUK", "TehDubstepChannel", "BassDropMedia", "USdubstep", "UNITEDubstep"];

    newSongsCommand.prototype.artists = ["Skrillex", "Doctor P", "Excision", "Flux Pavilion", "Knife Party", "Krewella", "Rusko", "Bassnectar", "Nero", "Deadmau5", "Borgore", "Zomboy"];

    return newSongsCommand;

  })(Command);

  whyWootCommand = (function(_super) {

    __extends(whyWootCommand, _super);

    function whyWootCommand() {
      return whyWootCommand.__super__.constructor.apply(this, arguments);
    }

    whyWootCommand.prototype.init = function() {
      this.command = '/whywoot';
      this.parseType = 'startsWith';
      return this.rankPrivelege = 'user';
    };

    whyWootCommand.prototype.functionality = function() {
      var msg, nameIndex;
      msg = "We dislike AFK djs. We calculate your AFK status by checking the last time you    	Woot'd or spoke. If you don't woot, I'll automagically remove you. Use our AutoWoot			script to avoid being removed: http://bit.ly/McZdWw";
      if ((nameIndex = this.msgData.message.indexOf('@')) !== -1) {
        return API.sendChat(this.msgData.message.substr(nameIndex) + ', ' + msg);
      } else {
        return API.sendChat(msg);
      }
    };

    return whyWootCommand;

  })(Command);

  themeCommand = (function(_super) {

    __extends(themeCommand, _super);

    function themeCommand() {
      return themeCommand.__super__.constructor.apply(this, arguments);
    }

    themeCommand.prototype.init = function() {
      this.command = '/theme';
      this.parseType = 'startsWith';
      return this.rankPrivelege = 'user';
    };

    themeCommand.prototype.functionality = function() {
      var msg;
      msg = "Any type of Bass Music is allowed here. Including Dubstep, Complextro, Drum and Bass, ";
      msg += "Garage, Breakbeat, Hardstyle, Moombahton, HEAVY EDM, House, Electro, and Trance!!";
      return API.sendChat(msg);
    };

    return themeCommand;

  })(Command);

  rulesCommand = (function(_super) {

    __extends(rulesCommand, _super);

    function rulesCommand() {
      return rulesCommand.__super__.constructor.apply(this, arguments);
    }

    rulesCommand.prototype.init = function() {
      this.command = '/rules';
      this.parseType = 'startsWith';
      return this.rankPrivelege = 'user';
    };

    rulesCommand.prototype.functionality = function() {
      var msg;
      msg = "1) Play good sound quality music. ";
      msg += "2) Don't replay a song on the room history. 3) Max song limit 8 minutes. ";
      msg += "4) DO NOT GO AWAY FROM KEYBOARD ON DECK! Please WOOT on DJ Booth and respect your fellow DJs!";
      return API.sendChat(msg);
    };

    return rulesCommand;

  })(Command);

  roomHelpCommand = (function(_super) {

    __extends(roomHelpCommand, _super);

    function roomHelpCommand() {
      return roomHelpCommand.__super__.constructor.apply(this, arguments);
    }

    roomHelpCommand.prototype.init = function() {
      this.command = '/roomhelp';
      this.parseType = 'startsWith';
      return this.rankPrivelege = 'user';
    };

    roomHelpCommand.prototype.functionality = function() {
      var msg1, msg2;
      msg1 = "Welcome to the Dubstep Den! Create a playlist and populate it with songs from either YouTube or Soundcloud.  ";
      msg1 += "Click the 'Join Waitlist' button and wait your turn to play music. Most electronic music allowed, type '/theme' for specifics.";
      msg2 = "Stay active while waiting to play your song or I'll remove you.  Play good quality music that hasn't been played recently (check room history).  ";
      msg2 += "Avoid over played artists like Skrillex. Ask a mod if you're unsure about your song choice";
      API.sendChat(msg1);
      return setTimeout((function() {
        return API.sendChat(msg2);
      }), 750);
    };

    return roomHelpCommand;

  })(Command);

  sourceCommand = (function(_super) {

    __extends(sourceCommand, _super);

    function sourceCommand() {
      return sourceCommand.__super__.constructor.apply(this, arguments);
    }

    sourceCommand.prototype.init = function() {
      this.command = ['/source', '/sourcecode', '/author'];
      this.parseType = 'exact';
      return this.rankPrivelege = 'user';
    };

    sourceCommand.prototype.functionality = function() {
      var msg;
      msg = 'Backus wrote me in CoffeeScript.  A generalized version of me should be available on github soon!';
      return API.sendChat(msg);
    };

    return sourceCommand;

  })(Command);

  wootCommand = (function(_super) {

    __extends(wootCommand, _super);

    function wootCommand() {
      return wootCommand.__super__.constructor.apply(this, arguments);
    }

    wootCommand.prototype.init = function() {
      this.command = '/woot';
      this.parseType = 'startsWith';
      return this.rankPrivelege = 'user';
    };

    wootCommand.prototype.functionality = function() {
      var msg, nameIndex;
      msg = "Please WOOT on DJ Booth and support your fellow DJs! AutoWoot: http://bit.ly/Lwcis0";
      if ((nameIndex = this.msgData.message.indexOf('@')) !== -1) {
        return API.sendChat(this.msgData.message.substr(nameIndex) + ', ' + msg);
      } else {
        return API.sendChat(msg);
      }
    };

    return wootCommand;

  })(Command);

  badQualityCommand = (function(_super) {

    __extends(badQualityCommand, _super);

    function badQualityCommand() {
      return badQualityCommand.__super__.constructor.apply(this, arguments);
    }

    badQualityCommand.prototype.init = function() {
      this.command = '.128';
      this.parseType = 'exact';
      return this.rankPrivelege = 'mod';
    };

    badQualityCommand.prototype.functionality = function() {
      var msg;
      msg = "Flagged for bad sound quality. Where do you get your music? The garbage can? Don't play this low quality tune again!";
      return API.sendChat(msg);
    };

    return badQualityCommand;

  })(Command);

  downloadCommand = (function(_super) {

    __extends(downloadCommand, _super);

    function downloadCommand() {
      return downloadCommand.__super__.constructor.apply(this, arguments);
    }

    downloadCommand.prototype.init = function() {
      this.command = '/download';
      this.parseType = 'exact';
      return this.rankPrivelege = 'user';
    };

    downloadCommand.prototype.functionality = function() {
      var e, eAuthor, eTitle, msg;
      e = encodeURIComponent;
      eAuthor = e(data.currentsong.author);
      eTitle = e(data.currentsong.title);
      msg = "Try this link for HIGH QUALITY DOWNLOAD: http://google.com/#hl=en&q=";
      msg += eAuthor + "%20-%20" + eTitle;
      msg += "%20site%3Azippyshare.com%20OR%20site%3Asoundowl.com%20OR%20site%3Ahulkshare.com%20OR%20site%3Asoundcloud.com";
      return API.sendChat(msg);
    };

    return downloadCommand;

  })(Command);

  afksCommand = (function(_super) {

    __extends(afksCommand, _super);

    function afksCommand() {
      return afksCommand.__super__.constructor.apply(this, arguments);
    }

    afksCommand.prototype.init = function() {
      this.command = '/afks';
      this.parseType = 'exact';
      return this.rankPrivelege = 'user';
    };

    afksCommand.prototype.functionality = function() {
      var dj, djAfk, djs, msg, now, _i, _len;
      msg = '';
      djs = API.getDJs();
      for (_i = 0, _len = djs.length; _i < _len; _i++) {
        dj = djs[_i];
        now = new Date();
        djAfk = now.getTime() - data.users[dj.id].getLastActivity().getTime();
        if (djAfk > (5 * 60 * 1000)) {
          if (msToStr(djAfk) !== false) {
            msg += dj.username + ' - ' + msToStr(djAfk);
            msg += '. ';
          }
        }
      }
      if (msg === '') {
        return API.sendChat("No one is AFK");
      } else {
        return API.sendChat('AFKs: ' + msg);
      }
    };

    return afksCommand;

  })(Command);

  allAfksCommand = (function(_super) {

    __extends(allAfksCommand, _super);

    function allAfksCommand() {
      return allAfksCommand.__super__.constructor.apply(this, arguments);
    }

    allAfksCommand.prototype.init = function() {
      this.command = '/allafks';
      this.parseType = 'exact';
      return this.rankPrivelege = 'user';
    };

    allAfksCommand.prototype.functionality = function() {
      var msg, now, u, uAfk, usrs, _i, _len;
      msg = '';
      usrs = API.getUsers();
      for (_i = 0, _len = usrs.length; _i < _len; _i++) {
        u = usrs[_i];
        now = new Date();
        uAfk = now.getTime() - data.users[u.id].getLastActivity().getTime();
        if (uAfk > (10 * 60 * 1000)) {
          if (msToStr(uAfk) !== false) {
            msg += u.username + ' - ' + msToStr(uAfk);
            msg += '. ';
          }
        }
      }
      if (msg === '') {
        return API.sendChat("No one is AFK");
      } else {
        return API.sendChat('AFKs: ' + msg);
      }
    };

    return allAfksCommand;

  })(Command);

  statusCommand = (function(_super) {

    __extends(statusCommand, _super);

    function statusCommand() {
      return statusCommand.__super__.constructor.apply(this, arguments);
    }

    statusCommand.prototype.init = function() {
      this.command = '/status';
      this.parseType = 'exact';
      return this.rankPrivelege = 'user';
    };

    statusCommand.prototype.functionality = function() {
      var day, hour, launch, lt, meridian, min, month, msg, t, totals;
      lt = data.launchTime;
      month = lt.getMonth() + 1;
      day = lt.getDate();
      hour = lt.getHours();
      meridian = hour % 12 === hour ? 'AM' : 'PM';
      min = lt.getMinutes();
      min = min < 10 ? '0' + min : min;
      t = data.totalVotingData;
      t['songs'] = data.songCount;
      launch = 'Initiated ' + month + '/' + day + ' ' + hour + ':' + min + ' ' + meridian + '. ';
      totals = '' + t.songs + ' songs have been played, accumulating ' + t.woots + ' woots, ' + t.mehs + ' mehs, and ' + t.curates + ' queues.';
      msg = launch + totals;
      return API.sendChat(msg);
    };

    return statusCommand;

  })(Command);

  unhookCommand = (function(_super) {

    __extends(unhookCommand, _super);

    function unhookCommand() {
      return unhookCommand.__super__.constructor.apply(this, arguments);
    }

    unhookCommand.prototype.init = function() {
      this.command = '/unhook events all';
      this.parseType = 'exact';
      return this.rankPrivelege = 'host';
    };

    unhookCommand.prototype.functionality = function() {
      API.sendChat('Unhooking all events...');
      return undoHooks();
    };

    return unhookCommand;

  })(Command);

  dieCommand = (function(_super) {

    __extends(dieCommand, _super);

    function dieCommand() {
      return dieCommand.__super__.constructor.apply(this, arguments);
    }

    dieCommand.prototype.init = function() {
      this.command = '/die';
      this.parseType = 'exact';
      return this.rankPrivelege = 'host';
    };

    dieCommand.prototype.functionality = function() {
      API.sendChat('Unhooking Events...');
      undoHooks();
      API.sendChat('Deleting bot data...');
      data.implode();
      return API.sendChat('Consider me dead');
    };

    return dieCommand;

  })(Command);

  reloadCommand = (function(_super) {

    __extends(reloadCommand, _super);

    function reloadCommand() {
      return reloadCommand.__super__.constructor.apply(this, arguments);
    }

    reloadCommand.prototype.init = function() {
      this.command = '/reload';
      this.parseType = 'exact';
      return this.rankPrivelege = 'host';
    };

    reloadCommand.prototype.functionality = function() {
      var pupSrc;
      API.sendChat('brb');
      undoHooks();
      pupSrc = data.pupScriptUrl;
      data.implode();
      return $.getScript(pupSrc);
    };

    return reloadCommand;

  })(Command);

  lockCommand = (function(_super) {

    __extends(lockCommand, _super);

    function lockCommand() {
      return lockCommand.__super__.constructor.apply(this, arguments);
    }

    lockCommand.prototype.init = function() {
      this.command = '/lock';
      this.parseType = 'exact';
      return this.rankPrivelege = 'mod';
    };

    lockCommand.prototype.functionality = function() {
      API.sendChat('Pop and lock dat ish');
      return data.lockBooth();
    };

    return lockCommand;

  })(Command);

  unlockCommand = (function(_super) {

    __extends(unlockCommand, _super);

    function unlockCommand() {
      return unlockCommand.__super__.constructor.apply(this, arguments);
    }

    unlockCommand.prototype.init = function() {
      this.command = '/unlock';
      this.parseType = 'exact';
      return this.rankPrivelege = 'mod';
    };

    unlockCommand.prototype.functionality = function() {
      API.sendChat('You\'ll never get the key to unlock my heart');
      return data.unlockBooth();
    };

    return unlockCommand;

  })(Command);

  swapCommand = (function(_super) {

    __extends(swapCommand, _super);

    function swapCommand() {
      return swapCommand.__super__.constructor.apply(this, arguments);
    }

    swapCommand.prototype.init = function() {
      this.command = '/swap';
      this.parseType = 'startsWith';
      return this.rankPrivelege = 'mod';
    };

    swapCommand.prototype.functionality = function() {
      var msg, r, swapRegex, userAdd, userRemove, users;
      msg = this.msgData.message;
      swapRegex = new RegExp("^/swap @(.+) for @(.+)$");
      users = swapRegex.exec(msg).slice(1);
      r = new RoomHelper();
      if (users.length === 2) {
        userRemove = r.lookupUser(users[0]);
        userAdd = r.lookupUser(users[1]);
        if (userRemove === false || userAdd === false) {
          API.sendChat('Error parsing one or both names');
          return false;
        } else {
          return data.lockBooth(function() {
            API.moderateRemoveDJ(userRemove.id);
            API.sendChat("Removing " + userRemove.username + "...");
            return setTimeout(function() {
              API.moderateAddDJ(userAdd.id);
              API.sendChat("Adding " + userAdd.username + "...");
              return setTimeout(function() {
                return data.unlockBooth();
              }, 1500);
            }, 1500);
          });
        }
      } else {
        return API.sendChat("Command didn't parse into two seperate usernames");
      }
    };

    return swapCommand;

  })(Command);

  popCommand = (function(_super) {

    __extends(popCommand, _super);

    function popCommand() {
      return popCommand.__super__.constructor.apply(this, arguments);
    }

    popCommand.prototype.init = function() {
      this.command = '/pop';
      this.parseType = 'exact';
      return this.rankPrivelege = 'mod';
    };

    popCommand.prototype.functionality = function() {
      var djs, popDj;
      djs = API.getDJs();
      popDj = djs[djs.length - 1];
      return API.moderateRemoveDJ(popDj.id);
    };

    return popCommand;

  })(Command);

  pushCommand = (function(_super) {

    __extends(pushCommand, _super);

    function pushCommand() {
      return pushCommand.__super__.constructor.apply(this, arguments);
    }

    pushCommand.prototype.init = function() {
      this.command = '/push';
      this.parseType = 'startsWith';
      return this.rankPrivelege = 'mod';
    };

    pushCommand.prototype.functionality = function() {
      var msg, name, r, user;
      msg = this.msgData.message;
      if (msg.length > this.command.length + 2) {
        name = msg.substr(this.command.length + 2);
        r = new RoomHelper();
        user = r.lookupUser(name);
        if (user !== false) {
          return API.moderateAddDJ(user.id);
        }
      }
    };

    return pushCommand;

  })(Command);

  resetAfkCommand = (function(_super) {

    __extends(resetAfkCommand, _super);

    function resetAfkCommand() {
      return resetAfkCommand.__super__.constructor.apply(this, arguments);
    }

    resetAfkCommand.prototype.init = function() {
      this.command = '/resetafk';
      this.parseType = 'startsWith';
      return this.rankPrivelege = 'mod';
    };

    resetAfkCommand.prototype.functionality = function() {
      var id, name, u, _ref;
      if (this.msgData.message.length > 10) {
        name = this.msgData.message.substring(11);
        _ref = data.users;
        for (id in _ref) {
          u = _ref[id];
          if (u.getUser().username === name) {
            u.updateActivity();
            API.sendChat('@' + u.getUser().username + '\'s AFK time has been reset.');
            return;
          }
        }
        API.sendChat('Not sure who ' + name + ' is');
      } else {
        API.sendChat('Yo Gimme a name r-tard');
      }
    };

    return resetAfkCommand;

  })(Command);

  forceSkipCommand = (function(_super) {

    __extends(forceSkipCommand, _super);

    function forceSkipCommand() {
      return forceSkipCommand.__super__.constructor.apply(this, arguments);
    }

    forceSkipCommand.prototype.init = function() {
      this.command = '/forceskip';
      this.parseType = 'startsWith';
      return this.rankPrivelege = 'mod';
    };

    forceSkipCommand.prototype.functionality = function() {
      var msg, param;
      msg = this.msgData.message;
      if (msg.length > 11) {
        param = msg.substr(11);
        if (param === 'enable') {
          data.forceSkip = true;
          return API.sendChat("Forced skipping enabled.");
        } else if (param === 'disable') {
          data.forceSkip = false;
          return API.sendChat("Forced skipping disabled.");
        }
      }
    };

    return forceSkipCommand;

  })(Command);

  fbCommand = (function(_super) {

    __extends(fbCommand, _super);

    function fbCommand() {
      return fbCommand.__super__.constructor.apply(this, arguments);
    }

    fbCommand.prototype.init = function() {
      this.command = '/fb';
      this.parseType = 'exact';
      return this.rankPrivelege = 'user';
    };

    fbCommand.prototype.functionality = function() {
      var m, msg;
      m = Math.floor(Math.random() * this.msgs.length);
      msg = this.msgs[m].replace('{fb}', 'http://on.fb.me/HNzK5S');
      return API.sendChat(msg);
    };

    fbCommand.prototype.msgs = ["Don't have any friends in real life? That's ok, we'll be your friend.  Join our facebook group: {fb}", "Wondering what TIMarbury looks like?  Join our facebook group ({fb}) and find out for yourself!", "We have a facebook group. Join it. Please. {fb}", "The Dubstep Den is now on friendster! lol just kidding.  Here's our facebook group: {fb} you should join.", "I bet you're handsome.  Join our facebook group so me0w can stalk your photos: {fb}"];

    return fbCommand;

  })(Command);

  overplayedCommand = (function(_super) {

    __extends(overplayedCommand, _super);

    function overplayedCommand() {
      return overplayedCommand.__super__.constructor.apply(this, arguments);
    }

    overplayedCommand.prototype.init = function() {
      this.command = '/overplayed';
      this.parseType = 'exact';
      return this.rankPrivelege = 'user';
    };

    overplayedCommand.prototype.functionality = function() {
      return API.sendChat("View the list of songs we consider overplayed and suggest additions at http://den.johnback.us/overplayed_tracks");
    };

    return overplayedCommand;

  })(Command);

  uservoiceCommand = (function(_super) {

    __extends(uservoiceCommand, _super);

    function uservoiceCommand() {
      return uservoiceCommand.__super__.constructor.apply(this, arguments);
    }

    uservoiceCommand.prototype.init = function() {
      this.command = ['/uservoice', '/idea'];
      this.parseType = 'exact';
      return this.rankPrivelege = 'user';
    };

    uservoiceCommand.prototype.functionality = function() {
      var msg;
      msg = 'Have an idea for the room, our bot, or an event?  Awesome! Submit it to our uservoice and we\'ll get started on it: http://is.gd/IzP4bA';
      msg += ' (please don\'t ask for mod)';
      return API.sendChat(msg);
    };

    return uservoiceCommand;

  })(Command);

  skipCommand = (function(_super) {

    __extends(skipCommand, _super);

    function skipCommand() {
      return skipCommand.__super__.constructor.apply(this, arguments);
    }

    skipCommand.prototype.init = function() {
      this.command = '/skip';
      this.parseType = 'exact';
      return this.rankPrivelege = 'mod';
    };

    skipCommand.prototype.functionality = function() {
      return API.moderateForceSkip();
    };

    return skipCommand;

  })(Command);

  whyMehCommand = (function(_super) {

    __extends(whyMehCommand, _super);

    function whyMehCommand() {
      return whyMehCommand.__super__.constructor.apply(this, arguments);
    }

    whyMehCommand.prototype.init = function() {
      this.command = '/whymeh';
      this.parseType = 'exact';
      return this.rankPrivelege = 'user';
    };

    whyMehCommand.prototype.functionality = function() {
      var msg;
      msg = "Reserve Mehs for songs that are a) extremely overplayed b) off genre c) absolutely god awful or d) troll songs. ";
      msg += "If you simply aren't feeling a song, then remain neutral";
      return API.sendChat(msg);
    };

    return whyMehCommand;

  })(Command);

  commandsCommand = (function(_super) {

    __extends(commandsCommand, _super);

    function commandsCommand() {
      return commandsCommand.__super__.constructor.apply(this, arguments);
    }

    commandsCommand.prototype.init = function() {
      this.command = '/commands';
      this.parseType = 'exact';
      return this.rankPrivelege = 'user';
    };

    commandsCommand.prototype.functionality = function() {
      var allowedUserLevels, c, cc, cmd, msg, user, _i, _j, _len, _len1, _ref, _ref1;
      allowedUserLevels = [];
      user = API.getUser(this.msgData.fromID);
      if (user.owner) {
        allowedUserLevels = ['user', 'mod', 'host'];
      } else if (user.moderator) {
        allowedUserLevels = ['user', 'mod'];
      } else {
        allowedUserLevels = ['user'];
      }
      msg = '';
      for (_i = 0, _len = cmds.length; _i < _len; _i++) {
        cmd = cmds[_i];
        c = new cmd('');
        if (_ref = c.rankPrivelege, __indexOf.call(allowedUserLevels, _ref) >= 0) {
          if (typeof c.command === "string") {
            msg += c.command + ', ';
          } else if (typeof c.command === "object") {
            _ref1 = c.command;
            for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
              cc = _ref1[_j];
              msg += cc + ', ';
            }
          }
        }
      }
      msg = msg.substring(0, msg.length - 2);
      return API.sendChat(msg);
    };

    return commandsCommand;

  })(Command);

  disconnectLookupCommand = (function(_super) {

    __extends(disconnectLookupCommand, _super);

    function disconnectLookupCommand() {
      return disconnectLookupCommand.__super__.constructor.apply(this, arguments);
    }

    disconnectLookupCommand.prototype.init = function() {
      this.command = '/dclookup';
      this.parseType = 'startsWith';
      return this.rankPrivelege = 'mod';
    };

    disconnectLookupCommand.prototype.functionality = function() {
      var cmd, dcHour, dcLookupId, dcMeridian, dcMins, dcSongsAgo, dcTimeStr, dcUser, disconnectInstances, givenName, id, recentDisconnect, resp, u, _i, _len, _ref, _ref1;
      cmd = this.msgData.message;
      if (cmd.length > 11) {
        givenName = cmd.slice(11);
        _ref = data.users;
        for (id in _ref) {
          u = _ref[id];
          if (u.getUser().username === givenName) {
            dcLookupId = id;
            disconnectInstances = [];
            _ref1 = data.userDisconnectLog;
            for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
              dcUser = _ref1[_i];
              if (dcUser.id === dcLookupId) {
                disconnectInstances.push(dcUser);
              }
            }
            if (disconnectInstances.length > 0) {
              resp = u.getUser().username + ' has disconnected ' + disconnectInstances.length.toString() + ' time';
              if (disconnectInstances.length === 1) {
                resp += '. ';
              } else {
                resp += 's. ';
              }
              recentDisconnect = disconnectInstances.pop();
              dcHour = recentDisconnect.time.getHours();
              dcMins = recentDisconnect.time.getMinutes();
              if (dcMins < 10) {
                dcMins = '0' + dcMins.toString();
              }
              dcMeridian = dcHour % 12 === dcHour ? 'AM' : 'PM';
              dcTimeStr = '' + dcHour + ':' + dcMins + ' ' + dcMeridian;
              dcSongsAgo = data.songCount - recentDisconnect.songCount;
              resp += 'Their most recent disconnect was at ' + dcTimeStr + ' (' + dcSongsAgo + ' songs ago). ';
              if (recentDisconnect.waitlistPosition !== void 0) {
                resp += 'They were ' + recentDisconnect.waitlistPosition + ' song';
                if (recentDisconnect.waitlistPosition > 1) {
                  resp += 's';
                }
                resp += ' away from the DJ booth.';
              } else {
                resp += 'They were not on the waitlist.';
              }
              API.sendChat(resp);
              return;
            } else {
              API.sendChat("I haven't seen " + u.getUser().username + " disconnect.");
              return;
            }
          }
        }
        return API.sendChat("I don't see a user in the room named '" + givenName + "'.");
      }
    };

    return disconnectLookupCommand;

  })(Command);

  voteRatioCommand = (function(_super) {

    __extends(voteRatioCommand, _super);

    function voteRatioCommand() {
      return voteRatioCommand.__super__.constructor.apply(this, arguments);
    }

    voteRatioCommand.prototype.init = function() {
      this.command = '/voteratio';
      this.parseType = 'startsWith';
      return this.rankPrivelege = 'mod';
    };

    voteRatioCommand.prototype.functionality = function() {
      var msg, name, r, u, votes;
      r = new RoomHelper();
      msg = this.msgData.message;
      if (msg.length > 12) {
        name = msg.substr(12);
        u = r.lookupUser(name);
        if (u !== false) {
          votes = r.userVoteRatio(u);
          msg = u.username + " has wooted " + votes['woot'].toString() + " time";
          if (votes['woot'] === 1) {
            msg += ', ';
          } else {
            msg += 's, ';
          }
          msg += "and meh'd " + votes['meh'].toString() + " time";
          if (votes['meh'] === 1) {
            msg += '. ';
          } else {
            msg += 's. ';
          }
          msg += "Their woot:vote ratio is " + votes['positiveRatio'].toString() + ".";
          return API.sendChat(msg);
        } else {
          return API.sendChat("I don't recognize a user named '" + name + "'");
        }
      } else {
        return API.sendChat("I'm not sure what you want from me...");
      }
    };

    return voteRatioCommand;

  })(Command);

  avgVoteRatioCommand = (function(_super) {

    __extends(avgVoteRatioCommand, _super);

    function avgVoteRatioCommand() {
      return avgVoteRatioCommand.__super__.constructor.apply(this, arguments);
    }

    avgVoteRatioCommand.prototype.init = function() {
      this.command = '/avgvoteratio';
      this.parseType = 'exact';
      return this.rankPrivelege = 'mod';
    };

    avgVoteRatioCommand.prototype.functionality = function() {
      var averageRatio, msg, r, ratio, roomRatios, uid, user, userRatio, votes, _i, _len, _ref;
      roomRatios = [];
      r = new RoomHelper();
      _ref = data.voteLog;
      for (uid in _ref) {
        votes = _ref[uid];
        user = data.users[uid].getUser();
        userRatio = r.userVoteRatio(user);
        roomRatios.push(userRatio['positiveRatio']);
      }
      averageRatio = 0.0;
      for (_i = 0, _len = roomRatios.length; _i < _len; _i++) {
        ratio = roomRatios[_i];
        averageRatio += ratio;
      }
      averageRatio = averageRatio / roomRatios.length;
      msg = "Accounting for " + roomRatios.length.toString() + " user ratios, the average room ratio is " + averageRatio.toFixed(2).toString() + ".";
      return API.sendChat(msg);
    };

    return avgVoteRatioCommand;

  })(Command);

  cmds = [hugCommand, tacoCommand, cookieCommand, punishCommand, newSongsCommand, whyWootCommand, themeCommand, rulesCommand, roomHelpCommand, sourceCommand, wootCommand, badQualityCommand, downloadCommand, afksCommand, allAfksCommand, statusCommand, unhookCommand, dieCommand, reloadCommand, lockCommand, unlockCommand, swapCommand, popCommand, pushCommand, overplayedCommand, uservoiceCommand, whyMehCommand, skipCommand, commandsCommand, resetAfkCommand, forceSkipCommand, fbCommand, cmdHelpCommand, protectCommand, disconnectLookupCommand, voteRatioCommand, avgVoteRatioCommand];

  chatCommandDispatcher = function(chat) {
    var c, cmd, _i, _len, _results;
    chatUniversals(chat);
    _results = [];
    for (_i = 0, _len = cmds.length; _i < _len; _i++) {
      cmd = cmds[_i];
      c = new cmd(chat);
      if (c.evalMsg()) {
        break;
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  updateVotes = function(obj) {
    data.currentwoots = obj.positive;
    data.currentmehs = obj.negative;
    return data.currentcurates = obj.curates;
  };

  announceCurate = function(obj) {
    return API.sendChat("/em: " + obj.user.username + " loves this song and Added");
  };




  handleNewSong = function(obj) {
    var songId;
    data.intervalMessages();
    if (data.currentsong === null) {
      data.newSong();
    } else {
      API.sendChat("/em: " + data.currentuser + " just Played is : " + data.currentsong.title + " by " + data.currentsong.author + ". Stats: Woots: " + data.currentwoots + ", Mehs: " + data.currentmehs + ", Added: " + data.currentcurates + ".");
      data.newSong();
      document.getElementById("button-vote-positive").click();
    }
    if (data.forceSkip) {
      songId = obj.media.id;
      return setTimeout(function() {
        var cMedia;
        cMedia = API.getMedia();
        if (cMedia.id === songId) {
          return API.moderateForceSkip();
        }
      }, obj.media.duration * 1000);
    }
  };

  handleVote = function(obj) {
    data.users[obj.user.id].updateActivity();
    return data.users[obj.user.id].updateVote(obj.vote);
  };

  handleUserLeave = function(user) {
    var disconnectStats, i, u, _i, _len, _ref;
    disconnectStats = {
      id: user.id,
      time: new Date(),
      songCount: data.songCount
    };
    i = 0;
    _ref = data.internalWaitlist;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      u = _ref[_i];
      if (u.id === user.id) {
        disconnectStats['waitlistPosition'] = i - 1;
        data.setInternalWaitlist();
        break;
      } else {
        i++;
      }
    }
    data.userDisconnectLog.push(disconnectStats);
    return data.users[user.id].inRoom(false);
  };

  antispam = function(chat) {
    var plugRoomLinkPatt, sender;
    plugRoomLinkPatt = /(\bhttps?:\/\/(www.)?plug\.dj[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    if (plugRoomLinkPatt.exec(chat.message)) {
      sender = API.getUser(chat.fromID);
      if (!sender.ambassador && !sender.moderator && !sender.owner && !sender.superuser) {
        if (!data.users[chat.fromID]["protected"]) {
          API.sendChat("Don't spam room links you ass clown");
          return API.moderateDeleteChat(chat.chatID);
        } else {
          return API.sendChat("I'm supposed to kick you, but you're just too darn pretty.");
        }
      }
    }
  };

  beggar = function(chat) {
    var msg, r, responses;
    msg = chat.message.toLowerCase();
    responses = ["Good idea @{beggar}!  Don't earn your fans or anything thats so yesterday", "Guys @{beggar} asked us to fan him!  Lets all totally do it! ?_?", "srsly @{beggar}? ?_?", "@{beggar}.  Earning his fans the good old fashioned way.  Hard work and elbow grease.  A true american."];
    r = Math.floor(Math.random() * responses.length);
    if (msg.indexOf('fan me') !== -1 || msg.indexOf('fan for fan') !== -1 || msg.indexOf('fan pls') !== -1 || msg.indexOf('fan4fan') !== -1 || msg.indexOf('add me to fan') !== -1) {
      return API.sendChat(responses[r].replace("{beggar}", chat.from));
    }
  };

  chatUniversals = function(chat) {
    data.activity(chat);
    antispam(chat);
    return beggar(chat);
  };

  hook = function(apiEvent, callback) {
    return API.addEventListener(apiEvent, callback);
  };

  unhook = function(apiEvent, callback) {
    return API.removeEventListener(apiEvent, callback);
  };

  apiHooks = [
    {
      'event': API.ROOM_SCORE_UPDATE,
      'callback': updateVotes
    }, {
      'event': API.CURATE_UPDATE,
      'callback': announceCurate
    }, {
      'event': API.USER_JOIN,
      'callback': handleUserJoin
    }, {
      'event': API.DJ_ADVANCE,
      'callback': handleNewSong
    }, {
      'event': API.VOTE_UPDATE,
      'callback': handleVote
    }, {
      'event': API.CHAT,
      'callback': chatCommandDispatcher
    }, {
      'event': API.USER_LEAVE,
      'callback': handleUserLeave
    }
  ];

  initHooks = function() {
    var pair, _i, _len, _results;
    _results = [];
    for (_i = 0, _len = apiHooks.length; _i < _len; _i++) {
      pair = apiHooks[_i];
      _results.push(hook(pair['event'], pair['callback']));
    }
    return _results;
  };

  undoHooks = function() {
    var pair, _i, _len, _results;
    _results = [];
    for (_i = 0, _len = apiHooks.length; _i < _len; _i++) {
      pair = apiHooks[_i];
      _results.push(unhook(pair['event'], pair['callback']));
    }
    return _results;
  };

  initialize();

}).call(this);
