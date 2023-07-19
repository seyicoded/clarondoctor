import firebase from 'firebase';

export const updateUserInfoToFirebase = async(user)=>{
    try {
        // send to firebase to update
    
        // send to firebase
        await firebase
        .firestore()
        .collection('users')
        .doc(`doctor-${user?.email}`)
        .set(user);
    } catch (error) {
        console.log(error, "error-updateUserInfoToFirebase");
    }
}