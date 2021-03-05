# Use system ffmpeg for now only Linux / Macos
FIND_PACKAGE(PkgConfig QUIET)

MACRO(FFMPEG_FIND varname shortname headername)

    PKG_CHECK_MODULES(PC_${varname} ${shortname})

    FIND_PATH(${varname}_INCLUDE_DIR "${shortname}/${headername}"
        HINTS ${PC_${varname}_INCLUDEDIR} ${PC_${varname}_INCLUDE_DIRS}
        NO_DEFAULT_PATH
    )

    IF(${varname}_INCLUDE_DIR STREQUAL "${varname}_INCLUDE_DIR-NOTFOUND")
        PKG_CHECK_MODULES(PC_${varname} "lib${shortname}")

        FIND_PATH(${varname}_INCLUDE_DIR "lib${shortname}/${headername}"
            HINTS ${PC_${varname}_INCLUDEDIR} ${PC_${varname}_INCLUDE_DIRS}
            NO_DEFAULT_PATH
            )
    ENDIF()

    IF(${${varname}_INCLUDE_DIR} STREQUAL "${varname}_INCLUDE_DIR-NOTFOUND")
        MESSAGE(STATUS "Can't find includes for ${shortname}...")
    ELSE()
        MESSAGE(STATUS "Found ${shortname} include dirs: ${${varname}_INCLUDE_DIR}")

        GET_FILENAME_COMPONENT(FFMPEG_PARENT ${${varname}_INCLUDE_DIR} PATH)

        FIND_LIBRARY(${varname}_LIBRARIES NAMES ${shortname}
            HINTS ${PC_${varname}_LIBDIR} ${PC_${varname}_LIBRARY_DIR} ${FFMPEG_PARENT})

        IF(${varname}_LIBRARIES STREQUAL "${varname}_LIBRARIES-NOTFOUND")
            FIND_LIBRARY(${varname}_LIBRARIES NAMES lib${shortname}
                HINTS ${PC_${varname}_LIBDIR} ${PC_${varname}_LIBRARY_DIR} ${FFMPEG_PARENT})
        ENDIF()

        IF(${varname}_LIBRARIES STREQUAL "${varname}_LIBRARIES-NOTFOUND")
            MESSAGE(WARNING "Can't find lib for ${shortname}...")
        ELSE()
            MESSAGE(STATUS "Found ${shortname} libs: ${${varname}_LIBRARIES}")
        ENDIF()

        IF(NOT ${varname}_INCLUDE_DIR STREQUAL "${varname}_INCLUDE_DIR-NOTFOUND"
            AND NOT ${varname}_LIBRARIES STREQUAL ${varname}_LIBRARIES-NOTFOUND)

            MESSAGE(STATUS "found ${shortname}: include ${${varname}_INCLUDE_DIR} lib ${${varname}_LIBRARIES}")
            SET(FFMPEG_${varname}_FOUND 1)
            SET(FFMPEG_${varname}_INCLUDE_DIRS ${${varname}_INCLUDE_DIR} CACHE STRING "" FORCE)
            SET(FFMPEG_${varname}_LIBS ${${varname}_LIBRARIES} CACHE STRING "" FORCE)
        ELSE()
            MESSAGE(WARNING "Can't find ${shortname}")
        ENDIF()

    ENDIF()

ENDMACRO(FFMPEG_FIND)

FFMPEG_FIND(LIBAVFORMAT   avformat   avformat.h)
FFMPEG_FIND(LIBAVCODEC    avcodec    avcodec.h)
FFMPEG_FIND(LIBAVUTIL     avutil     avutil.h)
FFMPEG_FIND(LIBAVFILTER   avfilter   avfilter.h)
FFMPEG_FIND(LIBSWSCALE    swscale    swscale.h)
FFMPEG_FIND(LIBSWRESAMPLE swresample swresample.h)

IF (FFMPEG_LIBSWRESAMPLE_FOUND AND FFMPEG_LIBAVFILTER_FOUND AND FFMPEG_LIBAVFORMAT_FOUND AND FFMPEG_LIBAVCODEC_FOUND AND FFMPEG_LIBAVUTIL_FOUND AND FFMPEG_LIBSWSCALE_FOUND)
    SET(FFMPEG_FOUND ON)

    ADD_LIBRARY(system_ffmpeg STATIC IMPORTED GLOBAL)
    ADD_LIBRARY(System::ffmpeg ALIAS system_ffmpeg)

    SET(FFMPEG_LIBRARIES
        ${FFMPEG_LIBAVFORMAT_LIBS}
        ${FFMPEG_LIBAVCODEC_LIBS}
        ${FFMPEG_LIBAVUTIL_LIBS}
        ${FFMPEG_LIBSWSCALE_LIBS}
        ${FFMPEG_LIBAVFILTER_LIBS}
        ${FFMPEG_LIBSWRESAMPLE_LIBS}
    )
    SET(FFMPEG_INCLUDE_DIRS
        ${FFMPEG_LIBAVFORMAT_INCLUDE_DIRS}
        ${FFMPEG_LIBAVCODEC_INCLUDE_DIRS}
        ${FFMPEG_LIBAVUTIL_INCLUDE_DIRS}
        ${FFMPEG_LIBAVFILTER_INCLUDE_DIRS}
        ${FFMPEG_LIBSWSCALE_INCLUDE_DIRS}
        ${FFMPEG_LIBSWRESAMPLE_INCLUDE_DIRS}
    )

    FOREACH(lib ${FFMPEG_LIBRARIES})
        SET_PROPERTY(TARGET system_ffmpeg PROPERTY IMPORTED_LOCATION ${lib})

        GET_FILENAME_COMPONENT(__extension ${lib} EXT)
        IF("${__extension}" STREQUAL ".so")
            TARGET_LINK_LIBRARIES(system_ffmpeg INTERFACE -Wl,--no-as-needed ${lib})
        ELSEIF("${__extension}" STREQUAL ".dll")
            STRING(REPLACE ".dll" ".lib" WINLIBFULLPATH ${lib})
            TARGET_LINK_LIBRARIES(system_ffmpeg INTERFACE ${WINLIBFULLPATH})
        ELSE()
            TARGET_LINK_LIBRARIES(system_ffmpeg INTERFACE ${lib})
        ENDIF()
    ENDFOREACH()

    FOREACH(inc ${FFMPEG_INCLUDE_DIRS})
        TARGET_INCLUDE_DIRECTORIES(system_ffmpeg INTERFACE ${inc})
    ENDFOREACH()
ELSE()
    SET(FFMPEG_FOUND OFF)

    MESSAGE(FATAL_ERROR "FFMPEG SYSTEM NOT FOUND.")
ENDIF()
