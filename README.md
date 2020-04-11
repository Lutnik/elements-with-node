# elements-with-node

### This is a learning experience - building own node.js application from scratch using express and mongodb.

The **elements branch** displays a gallery of pictures - called 'elements'. Users can login and view the elements and comments; once authenticated can add new elements, add/remove comments, manage their account (update details). Password reset via email is available, if user provides one.

### Working features:
- database with users, elements and comments, each related to another
- full user authentication using passport
- user management with password reset via email
- element search and pagination
- picture upload to cloudinary
- mobile-friendly layout

### ELEMENTS TODO:
- [x] elements pagination + results per page input
- [ ] add star rating to elements + rating option for users
- [ ] elements sorting (name, rating)
- [x] display comments links on user page
- [ ] add remove option to elements
- [x] migrate to cloudinary
- [ ] replace ethereal.email for password resets
- [ ] drag-and-drop image input
