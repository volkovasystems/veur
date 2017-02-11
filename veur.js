"use strict";

/*;
	@module-license:
		The MIT License (MIT)
		@mit-license

		Copyright (@c) 2017 Richeve Siodina Bebedor
		@email: richeve.bebedor@gmail.com

		Permission is hereby granted, free of charge, to any person obtaining a copy
		of this software and associated documentation files (the "Software"), to deal
		in the Software without restriction, including without limitation the rights
		to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
		copies of the Software, and to permit persons to whom the Software is
		furnished to do so, subject to the following conditions:

		The above copyright notice and this permission notice shall be included in all
		copies or substantial portions of the Software.

		THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
		IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
		FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
		AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
		LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
		OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
		SOFTWARE.
	@end-module-license

	@module-configuration:
		{
			"package": "veur",
			"path": "veur/veur.js",
			"file": "veur.js",
			"module": "veur",
			"author": "Richeve S. Bebedor",
			"eMail": "richeve.bebedor@gmail.com",
			"repository": "https://github.com/volkovasystems/veur.git",
			"test": "veur-test.js",
			"global": true
		}
	@end-module-configuration

	@module-documentation:
		View service.
	@end-module-documentation

	@include:
		{
			"clazof": "clazof",
			"express": "express",
			"falze": "falze",
			"falzy": "falzy",
			"handlebar": "handlebars",
			"harden": "harden",
			"kein": "kein",
			"lilfy": "lilfy",
			"lire": "lire",
			"offcache": "offcache",
			"Olivant": "olivant";
			"path": "path",
			"parseon": "parseon",
			"protype": "protype",
			"stuffed": "stuffed",
			"truly": "truly"
		}
	@end-include
*/

require( "olivant" );

const clazof = require( "clazof" );
const express = require( "express" );
const falze = require( "falze" );
const falzy = require( "falzy" );
const handlebar = require( "handlebars" );
const harden = require( "harden" );
const kein = require( "kein" );
const lilfy = require( "lilfy" );
const lire = require( "lire" );
const offcache = require( "offcache" );
const path = require( "path" );
const parseon = require( "parseon" );
const protype = require( "protype" );
const stuffed = require( "stuffed" );
const truly = require( "truly" );

harden( "DEFAULT_CLIENT_PATH", "/client" );
harden( "DEFAULT_VIEW_PATH", "/view" );
harden( "DEFAULT_INDEX", "index.html" );
harden( "DEFAULT_REDIRECT_PATH", "/view/status/page" );

/*;
	@option:
		{
			"middleware": APP,
			"rootPath": "string",
			"clientPath": "string",
			"viewPath": "string",
			"view": "string",
			"index": "string",
			"redirect": "string",
			"data": "object"
		}
	@end-option
*/
const veur = function veur( option ){
	/*;
		@meta-configuration:
			{
				"option:required": "object"
			}
		@end-meta-configuration
	*/

	option = option || { };

	let middleware = option.middleware || global.APP || express( );
	if( falze( middleware ) ){
		throw new Error( "no given middleware" );
	}

	if( !protype( middleware.use, FUNCTION ) ){
		throw new Error( "given middleware has no use method" );
	}

	let rootPath = option.rootPath || process.cwd( );
	if( falzy( rootPath ) || !protype( rootPath, STRING ) ){
		throw new Error( "invalid root path" );
	}

	let clientPath = option.clientPath || DEFAULT_CLIENT_PATH;
	if( falzy( clientPath ) || !protype( clientPath, STRING ) ){
		throw new Error( "invalid client path" );
	}

	let viewPath = option.viewPath || DEFAULT_VIEW_PATH;
	if( falzy( viewPath ) || !protype( viewPath, STRING ) ){
		throw new Error( "invalid view path" );
	}

	let index = option.index || DEFAULT_INDEX;
	if( falzy( index ) || !protype( index, STRING ) ){
		throw new Error( "invalid index" );
	}

	let redirect = option.redirect || DEFAULT_REDIRECT_PATH;
	if( falzy( redirect ) || !protype( redirect, STRING ) ){
		throw new Error( "invalid redirect" );
	}

	let data = option.data;
	if( truly( data ) && !protype( data, OBJECT ) ){
		throw new Error( "invalid data" );
	}

	let view = option.view || "";
	if( truly( view ) ){
		viewPath = [ `${ viewPath }/${ view }`, `${ viewPath }/${ view }/*` ];

	}else{
		viewPath = [ viewPath, `${ viewPath }/*` ];
	}

	let indexPath = path.resolve( rootPath, clientPath, view, index );

	let indexCache = { };

	let serverIndex = function serveIndex( index, request, response ){
		if( stuffed( request.query ) && kein( request.query, "data" ) ){
			try{
				let data = parseon( lilfy.revert( request.query.data ) );

				index = handlebar.compile( index )( data );

			}catch( error ){
				Issue( "processing view", error, request.query.data )
					.prompt( )
					.redirect( redirect )
					.send( response );

				return;
			}

		}else if( truu( data ) ){
			try{
				index = handlebar.compile( index )( data );

			}catch( error ){
				Issue( "processing view", error, data )
					.prompt( )
					.redirect( redirect )
					.send( response );

				return;
			}
		}

		offcache( response )
			.set( "Content-Type", "text/html" )
			.send( index );
	};

	middleware.use( viewPath, function view( request, response, next ){
		if( ( /\.[a-z0-9]{1,4}$/ ).test( request.path ) ){
			next( );

			return;
		}

		if( kein( indexCache, indexPath ) ){
			serverIndex( indexCache[ indexPath ], request, response );

			return;
		}

		lire( indexPath )
			( function done( error, index ){
				if( clazof( error, Error ) ){
					Issue( "reading view", error )
						.prompt( )
						.redirect( redirect )
						.send( response );

				}else if( truly( index ) ){
					serveIndex( index, request, response );

					indexCache[ indexPath ] = index;

				}else{
					Warning( "empty view", viewPath )
						.prompt( )
						.redirect( redirect )
						.send( response );
				}
			} );
	} );

	return middleware;
};

module.exports = veur;
