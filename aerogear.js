/* Need to add license, description, etc. */

(function( window, undefined ) {
    var aerogear = window.aerogear = {};
})( this );


/*********************************************** 
     Begin aerogear.pipeline.js 
***********************************************/ 

/* Need to add license, description, etc. */

// AeroGear Pipeline
(function( aerogear, undefined ) {
    function isArray( obj ) {
        return ({}).toString.call( obj ) === "[object Array]";
    }

    aerogear.pipeline = function( pipe ) {
        var pipeline = {};

        pipeline.add = function( pipe ) {
            var i,
                current,
                // initialize pipes if not already
                pipes = pipeline.pipes = pipeline.pipes || {};

            if ( typeof pipe === "string" ) {
                // pipe is a string so use
                pipes[ pipe ] = aerogear.pipeline.adapters.rest( pipe );
            } else if ( isArray( pipe ) ) {
                // pipe is an array so loop through each item in the array
                for ( i = 0; i < pipe.length; i++ ) {
                    current = pipe[ i ];

                    if ( typeof current === "string" ) {
                        pipes[ current ] = aerogear.pipeline.adapters.rest( current );
                    } else {
                        pipes[ current.name ] = aerogear.pipeline.adapters[ current.type || "rest" ]( current.name, current.recordId || "id", current.settings || {} );
                    }
                }
            } else if ( pipe ) {
                // pipe is an object so use that signature
                pipes[ pipe.name ] = aerogear.pipeline.adapters[ pipe.type || "rest" ]( pipe.name, pipe.recordId || "id", pipe.settings || {} );
            } else {
                // pipe is undefined so throw error
                throw "aerogear.pipeline: pipe is undefined";
            }

            pipeline.pipes = pipes;

            return pipeline;
        };

        pipeline.remove = function( pipe ) {
            var i,
                current,
                // initialize pipes if not already
                pipes = pipeline.pipes = pipeline.pipes || {};

            if ( typeof pipe === "string" ) {
                // pipe is a string so use
                delete pipes[ pipe ];
            } else if ( isArray( pipe ) ) {
                // pipe is an array so loop through each item in the array
                for ( i = 0; i < pipe.length; i++ ) {
                    current = pipe[ i ];

                    if ( typeof current === "string" ) {
                        delete pipes[ current ];
                    } else {
                        delete pipes[ current.name ];
                    }
                }
            } else if ( pipe ) {
                // pipe is an object so use that signature
                delete pipes[ pipe.name ];
            }

            pipeline.pipes = pipes;

            return pipeline;
        };

        return pipeline.add( pipe );
    };

    aerogear.pipeline.adapters = {};
})( aerogear );


/*********************************************** 
     Begin rest.js 
***********************************************/ 

/* Need to add license, description, etc. */

// Rest Adapter (default)
(function( aerogear, $, undefined ) {
    aerogear.pipeline.adapters.rest = function( pipeName, recordId, ajaxSettings ) {
        ajaxSettings = $.extend({
            // use the pipeName as the default rest endpoint
            url: pipeName
        }, ajaxSettings );

        return {
            recordId: recordId,
            type: "rest",
            read: function( options ) {
                var data;
                if ( options ) {
                    if ( options.ajax && options.ajax.data ) {
                        data = options.ajax.data;
                    } else if ( options.data ) {
                        data = options.data;
                    }
                    if ( data ) {
                        options.ajax.data = data;
                    }
                } else {
                    options = {};
                }

                return $.ajax( $.extend( {}, ajaxSettings, { type: "GET" }, options.ajax || {} ) );
            },

            save: function( data, options ) {
                data = data || {};
                options = options || {};

                var type = data[ recordId ] ? "PUT" : "POST";
                if ( typeof data !== "string" ) {
                    data = JSON.stringify( data );
                }

                return $.ajax( $.extend( {}, ajaxSettings,
                    {
                        type: type,
                        data: data
                    },
                    options.ajax || {}
                ));
            },

            delete: function( options ) {
                var data;
                options = options || {};
                if ( typeof options.record === "string" || typeof options.record === "number" ) {
                    data = { id: options.record };
                } else {
                    data = options.record;
                }

                return $.ajax( $.extend( {}, ajaxSettings,
                    {
                        type: "DELETE",
                        data: data
                    },
                    options.ajax || {}
                ));
            }
        };
    };
})( aerogear, jQuery );
