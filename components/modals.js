import React, {useState} from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Icon, Input, Layout, Card, Text, Modal } from '@ui-kitten/components';

export const error = ({visible, callback, message}) => {
  
    const [show, setshow] = useState(visible)

    const dismiss = ()=>{
        setshow(false)
        callback()
    }

    console.log(show)

    return (
        <Modal
          visible={show}
          backdropStyle={styles.backdrop}
          onBackdropPress={dismiss}>
          <Card disabled={true}>
            <Text category={'s1'} status={'danger'} style={{margin: 10, textAlign: 'center'}}>{message}</Text>
            <Button status={'basic'} appearance={'outline'} onPress={dismiss}>
              Okay
            </Button>
          </Card>
        </Modal>
    );
};
  
const styles = StyleSheet.create({
    container: {
      minHeight: 192,
    },
    backdrop: {
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
});