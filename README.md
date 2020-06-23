# elements-with-node

### This is a learning experience - started as a bootcamp project and evolved into a useful app to archive childrens' drawings (there are A LOT of them :-)).

#### From the tech perspective the app has ben build with Node.js using Express framework and mongodb + Cloudinary for storage. Passport package for proper user management with local password strategy.


### Features:
- The **drawings branch** is a switch from any picture to children drawings archive specifically. 
- User management:
  * Register/login
  * Edit user info
  * Define "tags" - names that can be later used to identify the author of the drawing
  * Allow to add/manage pictures and comments
  * Reset password (via email token)
- Drawings gallery with search option
- Details page with details, comments and fullscreen modal

### DRAWINGS TODO
- [x] parse IPTC data on file load
- [ ] uprgade pagination navigatoin 
- [ ] add admin role
- [x] change schemas to accomodate new features 
  - element: tags, date drawn
  - user: favourites, tags
- [x] add tags
- [x] add option to remove drawings
- [x] search redo to make ue of tags/favourites/drawn date with sorting option
- [x] input drag&drop
- [x] switch to light theme
- [ ] add polish language (multilang perhaps?)

