# Changelog

## [0.0.4] - 2019-05-24

### Added

- Outline on /color message info
- /help command

### Changed

- Now shows date on mobile when we press the message 

### Fixed

- Empty username are no longer added to dom (taking small space in front of message)
- Black is base color for chat history
- User-select in chat history

### Removed

### Security


## [0.0.3] - 2019-05-23

### Added

- Can rename to a multiple word name
- /roll command
- Error message in chat when user lose connexion to server
- Feedback to user when command is executed
- Command color support
- Added colors to the usernames

### Changed

- Changed username color style

### Fixed

- Fix 2 connexions created when clicking multiple times on join button
- Empty username
- Fixed hour to print 00:00 format (previous version didn't have leading 0s)
- Added max limit to the number of messages stored on the server messages array, prevents server memory overload

## [0.0.2] - 2019-05-22

### Added
- Join when you press enter on the input
- Validation on join input (between 3 & 20 characters)
- Minimum size of 1 to send message
- Maximum size of 255 to send message (Twitter size)

### Changed
- Made responsive better by putting width to 100% on chat when switching to mobile

### Deprecated
- Substring on the name input when you join the chat, now restrict it instead of validating

### Fixed
- Padding between timestamp, username & message
- Date received from the server was a string, had to turn it into an object again 
before using it