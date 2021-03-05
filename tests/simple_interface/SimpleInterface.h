// MathLibrary.h - Contains declarations of math functions
#pragma once

extern "C" void *ffmpegCppCreate(const char *outputFileName);

extern "C" void ffmpegCppAddVideoStream(void *handle,
                                        const char *videoFileName);
extern "C" void ffmpegCppAddAudioStream(void *handle,
                                        const char *audioFileName);

extern "C" void ffmpegCppAddVideoFilter(void *handle, const char *filterString);
extern "C" void ffmpegCppAddAudioFilter(void *handle, const char *filterString);

extern "C" void ffmpegCppGenerate(void *handle);

extern "C" bool ffmpegCppIsError(void *handle);
extern "C" const char *ffmpegCppGetError(void *handle);

extern "C" void ffmpegCppClose(void *handle);