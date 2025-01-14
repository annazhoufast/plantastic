package sessions

import (
	"crypto/hmac"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"errors"
)

// InvalidSessionID represents an empty, invalid session ID
const InvalidSessionID SessionID = ""

// idLength is the length of the ID portion
const idLength = 32

//SessionID represents a valid, digitally-signed session ID.
//This is a base64 URL encoded string created from a byte slice
//where the first `idLength` bytes are crytographically random
//bytes representing the unique session ID, and the remaining bytes
//are an HMAC hash of those ID bytes (i.e., a digital signature).
//The byte slice layout is like so:
//+-----------------------------------------------------+
//|...32 crypto random bytes...|HMAC hash of those bytes|
//+-----------------------------------------------------+
type SessionID string

//ErrInvalidID is returned when an invalid session id is passed to ValidateID()
var ErrInvalidID = errors.New("Invalid Session ID")

func NewSessionID(signingKey string) (SessionID, error) {
	// if signingKey is len 0, return InvalidSessionID
	if len(signingKey) == 0 {
		return InvalidSessionID, errors.New("Signing Key may not be empty")
	}

	// Generate a new digitally signed SessionID that follows the spec of SessionID
	randomBytes := make([]byte, idLength)
	_, err := rand.Read(randomBytes)
	if err != nil {
		return InvalidSessionID, err
	}
	remaining := hmac.New(sha256.New, []byte(signingKey))
	remaining.Write(randomBytes)
	remainingBytes := remaining.Sum(nil)
	finalByteSlice := append(randomBytes, remainingBytes...)
	finalSessionID := SessionID(base64.URLEncoding.EncodeToString(finalByteSlice))
	return finalSessionID, nil
}

//ValidateID validates the string in the `id` parameter
//using the `signingKey` as the HMAC signing key
//and returns an error if invalid, or a SessionID if valid
func ValidateID(id string, signingKey string) (SessionID, error) {
	decodedID, err := base64.URLEncoding.DecodeString(id)
	if err != nil {
		return InvalidSessionID, err
	}
	idPortion := decodedID[0:idLength]
	compare := decodedID[idLength:]
	remaining := hmac.New(sha256.New, []byte(signingKey))
	_, writeErr := remaining.Write(idPortion)
	if writeErr != nil {
		return InvalidSessionID, writeErr
	}
	remainingBytes := remaining.Sum(nil)
	if hmac.Equal(compare, remainingBytes) {
		return SessionID(id), nil
	}
	return InvalidSessionID, ErrInvalidID
}

//String returns a string representation of the sessionID
func (sid SessionID) String() string {
	return string(sid)
}
