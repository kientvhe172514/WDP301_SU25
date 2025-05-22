import React from 'react'

const ProfilePage = () => {
  return (
    <model-viewer
      src="https://cdn.shopify.com/s/files/1/0823/2121/1739/files/3DMODEL2.gltf?v=1726023108"
      alt="A 3D model"
      auto-rotate
      min-camera-orbit="auto auto 18m"
      max-camera-orbit="auto auto 18m"
      camera-controls
      disable-zoom
      environment-image="https://cdn.shopify.com/s/files/1/0823/2121/1739/files/clouds.jpg?v=1726024215"
      skybox-image="https://cdn.shopify.com/s/files/1/0823/2121/1739/files/cloudyskyeditted.jpg?v=1726025777"
      exposure="2.5"
      style="width: 100%; height: 700px;">
    </model-viewer>

  )
}

export default ProfilePage

