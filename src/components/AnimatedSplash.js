import { useState, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import * as SplashScreen from 'expo-splash-screen';

// Prevent the native splash screen from hiding immediately
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function AnimatedSplash({ children }) {
  const [isVideoFinished, setVideoFinished] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const onVideoReadyForDisplay = () => {
    // Hide the native splash screen as soon as the video is ready to be shown
    SplashScreen.hideAsync().catch(() => {});
  };

  const onPlaybackStatusUpdate = (status) => {
    if (status.didJustFinish) {
      // Fade out the video smoothly
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 800, // 800ms fade transition
        useNativeDriver: true,
      }).start(() => {
        setVideoFinished(true); // Remove video component completely from tree
      });
    }
  };

  return (
    <View style={styles.container}>
      {/* 
        We render the main App beneath the video, 
        so it's fully loaded and ready once the fade-out occurs 
      */}
      {children}
      
      {!isVideoFinished && (
        <Animated.View style={[styles.videoContainer, { opacity: fadeAnim }]} pointerEvents="none">
          <Video
            style={StyleSheet.absoluteFill}
            source={require('../../assets/splash-video.mp4')}
            resizeMode={ResizeMode.CONTAIN}
            shouldPlay
            isMuted={true}
            onReadyForDisplay={onVideoReadyForDisplay}
            onPlaybackStatusUpdate={onPlaybackStatusUpdate}
          />
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  videoContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000', // Matches video black background to hide bars
    zIndex: 9999, // Guarantee it covers the navigation stack
    elevation: 9999,
  }
});
