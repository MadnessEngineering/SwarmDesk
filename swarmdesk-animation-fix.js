// SwarmDesk Animation Fix - Patches the animation function to prevent errors
// This file should be loaded after swarmdesk.js to patch the animate function

(function ()
{
    console.log('🔧 Applying SwarmDesk animation fix...');

    // Store the original animate function if it exists
    const originalAnimate = window.animate;

    // Replace with a safer version
    window.animate = function (currentTime)
    {
        // Guard against uninitialized objects
        if (!window.scene || !window.camera || !window.renderer)
        {
            // Try again in a moment
            requestAnimationFrame(window.animate);
            return;
        }

        // Call the original animate if it exists and objects are ready
        if (originalAnimate && typeof originalAnimate === 'function')
        {
            try
            {
                originalAnimate(currentTime);
            } catch (error)
            {
                console.warn('⚠️ SwarmDesk animation error caught:', error);
                // Continue animation loop even if there's an error
                requestAnimationFrame(window.animate);
            }
        }
    };

    // Also add missing global variables if they don't exist
    if (typeof window.euler === 'undefined')
    {
        window.euler = new THREE.Euler(0, 0, 0, 'YXZ');
    }
    if (typeof window.pointerLocked === 'undefined')
    {
        window.pointerLocked = false;
    }
    if (typeof window.currentAgent === 'undefined')
    {
        window.currentAgent = null;
    }
    if (typeof window.nearAgent === 'undefined')
    {
        window.nearAgent = null;
    }
    if (typeof window.nearReadmePanel === 'undefined')
    {
        window.nearReadmePanel = null;
    }
    if (typeof window.nearMCPWall === 'undefined')
    {
        window.nearMCPWall = null;
    }
    if (typeof window.activePanelType === 'undefined')
    {
        window.activePanelType = null;
    }
    if (typeof window.keys === 'undefined')
    {
        window.keys = {
            KeyW: 'moveForward',
            KeyS: 'moveBackward',
            KeyA: 'moveLeft',
            KeyD: 'moveRight'
        };
    }

    console.log('✅ SwarmDesk animation fix applied');
})();
