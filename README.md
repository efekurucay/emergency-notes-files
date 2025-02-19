# Emergency Notes Application

A modern web application for managing emergency notes, files, and their relationships. Built with Node.js and Express.js, featuring a dark theme and an interactive graph view.

Live Demo: https://efekurucay.com/livedemo/emergency-notes/

![Emergency Notes App](screenshots/ss.png)

## Features

- 📝 **Note Management**
  - Create, edit, and delete notes
  - Priority levels (Urgent, Important, Normal)
  - Tag support
  - Automatic URL detection and linking
  - Rich text formatting

- 📁 **File Management**
  - Drag and drop file upload
  - Support for Turkish characters in filenames
  - File type icons
  - Secure file handling
  - Preview and download options

- 🔍 **Search and Filter**
  - Real-time search in notes and files
  - Filter by priority
  - Tag-based filtering
  - Advanced sorting options

- 📊 **Graph View**
  - Interactive visualization of notes and their relationships
  - View connections between notes, tags, and URLs
  - Zoom and pan controls
  - Export graph as PNG
  - Detailed node information panel

- 🎨 **Modern UI/UX**
  - Dark theme
  - Responsive design
  - Smooth animations
  - Bootstrap 5 integration
  - Custom icons

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/emergency-notes.git
cd emergency-notes
```

2. Install dependencies:
```bash
npm install
```

3. Start the application:
```bash
npm start
```

The application will be available at `http://localhost:3000`

## Dependencies

- Express.js - Web application framework
- EJS - Template engine
- Multer - File upload handling
- Bootstrap 5 - Frontend framework
- Vis.js - Graph visualization
- html2canvas - Graph export functionality

## Project Structure

```
emergency-notes/
├── app.js              # Main application file
├── package.json        # Project dependencies
├── public/            
│   └── css/           # Stylesheets
├── uploads/           # Uploaded files directory
├── views/             # EJS templates
│   ├── index.ejs      # Main page
│   └── graph.ejs      # Graph view
└── README.md          # Project documentation
```

## Usage

1. **Adding Notes**
   - Enter note content
   - Select priority level
   - Add tags (comma-separated)
   - Click "Add Note"

2. **Uploading Files**
   - Drag and drop files or click to select
   - Supports all file types
   - Files are stored in the uploads directory

3. **Using Graph View**
   - Click "Relationship Graph" to open
   - Use controls to zoom and pan
   - Filter nodes by type
   - Click nodes for detailed information
   - Export visualization as PNG

## Deployment

To deploy the application to your website:

1. Upload all files to your desired directory
2. Install dependencies using `npm install`
3. Configure your web server (Apache/Nginx) to proxy requests to Node.js
4. Start the application using PM2 or similar process manager:
```bash
pm2 start app.js --name "emergency-notes"
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

Yahya Efe Kuruçay
- Email: contact@efekurucay.com
- Website: [efekurucay.com](https://efekurucay.com)

## Acknowledgments

- Bootstrap Icons for the beautiful icon set
- Vis.js team for the graph visualization library
- The Node.js and Express.js communities 