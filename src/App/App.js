import React, {Component} from 'react';
import {Route, Link} from 'react-router-dom';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import NoteListNav from '../NoteListNav/NoteListNav';
import NotePageNav from '../NotePageNav/NotePageNav';
import NoteListMain from '../NoteListMain/NoteListMain';
import NotePageMain from '../NotePageMain/NotePageMain';

import {getNotesForFolder, findNote, findFolder} from '../notes-helpers';
import './App.css';
import UserContext from '../UserContext';

class App extends Component {
    state = {
        notes: [],
        folders: []
    };


    //this.setState(this.state.notes.filter((noteId) =>
    //noteId !== jsonfunction 
    //))
    deleteNote = (noteId) => {
        console.log('deleteNote in Apps working', noteId)
      return  (
        fetch(`http://localhost:9090/notes/${noteId}`, 
        {method: 'DELETE',
        headers: {
            'content-type': 'application/json'
          }})
        .then(response => response.json())
        .then(jsonfunction => console.log(jsonfunction))
      )}
    componentDidMount() {

       Promise.all([
        fetch(`http://localhost:9090/notes`),
        fetch(`http://localhost:9090/folders`)
        ])
        .then(([responseNote, responseFolder]) => 
            Promise.all([responseNote.json(), responseFolder.json()])
            .then(([notes, folders]) => this.setState({notes, folders}))
         )
    }

    renderNavRoutes() {
        const {notes, folders} = this.state;
        return (
            <>
                <UserContext.Provider value={{...this.state}}>
                    {['/', '/folder/:folderId'].map(path => (
                        <Route
                            exact
                            key={path}
                            path={path}
                            render={routeProps => (
                                <NoteListNav
                                    folders={folders}
                                    notes={notes}
                                    deleteNote={this.deleteNote}
                                    {...routeProps}
                                />
                            )}
                        />
                    ))}
                    <Route
                        path="/note/:noteId"
                        render={routeProps => {
                            const {noteId} = routeProps.match.params;
                            const note = findNote(notes, noteId) || {};
                            const folder = findFolder(folders, note.folderId);
                            return <NotePageNav {...routeProps} folder={folder} />;
                        }}
                    />
                    <Route path="/add-folder" component={NotePageNav} />
                    <Route path="/add-note" component={NotePageNav} />
                </UserContext.Provider>
            </>
        );
    }

    renderMainRoutes() {
        const {notes, folders} = this.state;
        return (
            <>
                <UserContext.Provider value={{...this.state}}>
                    {['/', '/folder/:folderId'].map(path => (
                        <Route
                            exact
                            key={path}
                            path={path}
                            render={routeProps => {
                                const {folderId} = routeProps.match.params;
                                const notesForFolder = getNotesForFolder(
                                    notes,
                                    folderId
                                );
                                return (
                                    <NoteListMain
                                        {...routeProps}
                                        notes={notesForFolder}
                                        deleteNote = {this.deleteNote}
                                    />
                                );
                            }}
                        />
                    ))}
                    <Route
                        path="/note/:noteId"
                        render={routeProps => {
                            const {noteId} = routeProps.match.params;
                            const note = findNote(notes, noteId);
                            return <NotePageMain {...routeProps} note={note} deleteNote={this.deleteNote}/>;
                        }}
                    />
                </UserContext.Provider>
            </>
        );
    }

    render() {
        console.log(this.state)
        return (
            <div className="App">
                <nav className="App__nav">{this.renderNavRoutes()}</nav>
                <header className="App__header">
                    <h1>
                        <Link to="/">Noteful</Link>{' '}
                        <FontAwesomeIcon icon="check-double" />
                    </h1>
                </header>
                <main className="App__main">{this.renderMainRoutes()}</main>
            </div>
        );
    }
}

export default App;
